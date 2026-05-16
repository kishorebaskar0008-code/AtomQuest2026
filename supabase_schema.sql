-- GoalTrack - AtomQuest Hackathon 1.0
-- Database Schema (PostgreSQL for Supabase)

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('employee', 'manager', 'admin');
CREATE TYPE uom_type AS ENUM ('numeric_min', 'numeric_max', 'timeline', 'zero_based');
CREATE TYPE goal_status AS ENUM ('draft', 'submitted', 'approved', 'returned', 'locked');
CREATE TYPE checkin_status AS ENUM ('not_started', 'on_track', 'completed');
CREATE TYPE escalation_type AS ENUM ('goal_not_submitted', 'goal_not_approved', 'checkin_not_completed');
CREATE TYPE escalation_status AS ENUM ('pending', 'notified', 'resolved');

-- 2. TABLES

-- Users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'employee',
    department VARCHAR(100),
    manager_id UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thrust Areas table
CREATE TABLE public.thrust_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cycles table
CREATE TABLE public.cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    goal_setting_start DATE NOT NULL,
    goal_setting_end DATE NOT NULL,
    q1_start DATE NOT NULL,
    q1_end DATE NOT NULL,
    q2_start DATE NOT NULL,
    q2_end DATE NOT NULL,
    q3_start DATE NOT NULL,
    q3_end DATE NOT NULL,
    q4_start DATE NOT NULL,
    q4_end DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one active cycle
CREATE UNIQUE INDEX idx_only_one_active_cycle ON public.cycles (is_active) WHERE is_active = true;

-- Goals table
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.users(id),
    manager_id UUID REFERENCES public.users(id),
    thrust_area_id UUID REFERENCES public.thrust_areas(id),
    cycle_id UUID REFERENCES public.cycles(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    uom_type uom_type NOT NULL,
    target_value DECIMAL(15,2), -- For numeric/zero_based
    target_date DATE, -- For timeline
    weightage DECIMAL(5,2) NOT NULL CHECK (weightage >= 10),
    status goal_status DEFAULT 'draft',
    is_shared_goal BOOLEAN DEFAULT false,
    manager_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-ins table
CREATE TABLE public.check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.goals(id),
    employee_id UUID NOT NULL REFERENCES public.users(id),
    manager_id UUID REFERENCES public.users(id),
    cycle_id UUID REFERENCES public.cycles(id),
    quarter VARCHAR(2) NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
    actual_value DECIMAL(15,2),
    actual_date DATE,
    status checkin_status NOT NULL DEFAULT 'not_started',
    notes TEXT,
    progress_score DECIMAL(5,2) DEFAULT 0 CHECK (progress_score >= 0 AND progress_score <= 100),
    manager_comment TEXT,
    manager_checked_in BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(goal_id, quarter, cycle_id)
);

-- Shared Goals table (Junction)
CREATE TABLE public.shared_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_goal_id UUID NOT NULL REFERENCES public.goals(id),
    pushed_to_user_id UUID NOT NULL REFERENCES public.users(id),
    pushed_by_user_id UUID NOT NULL REFERENCES public.users(id),
    weightage DECIMAL(5,2) NOT NULL CHECK (weightage >= 10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(original_goal_id, pushed_to_user_id)
);

-- Audit Logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID REFERENCES public.goals(id),
    changed_by UUID REFERENCES public.users(id),
    change_type VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Escalation Rules table
CREATE TABLE public.escalation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type escalation_type NOT NULL UNIQUE,
    days_threshold SMALLINT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Escalations table
CREATE TABLE public.escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES public.escalation_rules(id),
    triggered_for UUID NOT NULL REFERENCES public.users(id),
    triggered_against UUID NOT NULL REFERENCES public.users(id),
    cycle_id UUID REFERENCES public.cycles(id),
    type escalation_type NOT NULL,
    quarter VARCHAR(2), -- NULL for goal setting
    status escalation_status DEFAULT 'pending',
    escalation_level SMALLINT DEFAULT 1 CHECK (escalation_level BETWEEN 1 AND 3),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 3. FUNCTIONS & TRIGGERS

-- Function to calculate progress score
CREATE OR REPLACE FUNCTION calculate_progress_score()
RETURNS TRIGGER AS $$
DECLARE
    v_uom uom_type;
    v_target_val DECIMAL;
    v_target_date DATE;
BEGIN
    SELECT uom_type, target_value, target_date INTO v_uom, v_target_val, v_target_date
    FROM public.goals WHERE id = NEW.goal_id;

    IF v_uom = 'numeric_min' THEN
        NEW.progress_score := LEAST((NEW.actual_value / NULLIF(v_target_val, 0)) * 100, 100);
    ELSIF v_uom = 'numeric_max' THEN
        NEW.progress_score := LEAST((v_target_val / NULLIF(NEW.actual_value, 0)) * 100, 100);
    ELSIF v_uom = 'timeline' THEN
        IF NEW.actual_date <= v_target_date THEN NEW.progress_score := 100; ELSE NEW.progress_score := 0; END IF;
    ELSIF v_uom = 'zero_based' THEN
        IF NEW.actual_value = 0 THEN NEW.progress_score := 100; ELSE NEW.progress_score := 0; END IF;
    END IF;

    IF NEW.progress_score IS NULL THEN NEW.progress_score := 0; END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_progress_score
BEFORE INSERT OR UPDATE OF actual_value, actual_date ON public.check_ins
FOR EACH ROW EXECUTE FUNCTION calculate_progress_score();

-- Function for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER trg_checkins_updated_at BEFORE UPDATE ON public.check_ins FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 4. RLS POLICIES (Basic)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- Users: See own and team
CREATE POLICY "Users can see themselves and team" ON public.users FOR SELECT USING (
    auth.uid() = id OR manager_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- Goals: Employee see/edit own, Manager see team, Admin all
CREATE POLICY "Goals visibility" ON public.goals FOR SELECT USING (
    employee_id = auth.uid() OR manager_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- 5. INITIAL SEED DATA
INSERT INTO public.thrust_areas (name) VALUES 
('Sales & Revenue Growth'), ('Product Innovation'), ('Manufacturing Excellence'), 
('Marketing & Brand Building'), ('Customer Delight'), ('Supply Chain & Operations'), 
('People & Culture'), ('Financial Discipline');
