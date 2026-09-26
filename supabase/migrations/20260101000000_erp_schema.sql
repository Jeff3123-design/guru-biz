-- Supabase ERP Schema Migration
-- Migration: 20260101000000_erp_schema.sql

-- 1. Create User Profiles & Roles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'accountant', 'sales')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function for automatic profile creation on auth.users creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'sales')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to fetch logged-in user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = auth.uid();

    RETURN COALESCE(user_role, 'sales');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Core Operational Tables
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    buying_price NUMERIC(12, 2) NOT NULL,
    selling_price NUMERIC(12, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('draft', 'sent', 'approved', 'rejected')) DEFAULT 'draft',
    total_amount NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('unpaid', 'partially_paid', 'paid', 'overdue')) DEFAULT 'unpaid',
    subtotal NUMERIC(12, 2) DEFAULT 0.00,
    tax NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.delivery_slips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'dispatched', 'delivered')) DEFAULT 'pending',
    dispatched_at TIMESTAMPTZ,
    carrier_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pos_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cashier_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    payment_method TEXT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    receipt_number TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type TEXT CHECK (document_type IN ('quotation', 'invoice', 'pos_order')) NOT NULL,
    document_id UUID NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_phone TEXT NOT NULL,
    channel TEXT CHECK (channel IN ('sms', 'whatsapp')) NOT NULL,
    message_body TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row-Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES Policies
CREATE POLICY "Profiles view policy" ON public.profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Profiles update admin policy" ON public.profiles
    FOR UPDATE USING (public.get_user_role() = 'admin');

-- CUSTOMERS Policies
CREATE POLICY "Customers read policy" ON public.customers
    FOR SELECT USING (public.get_user_role() IN ('admin', 'accountant', 'sales'));

CREATE POLICY "Customers insert policy" ON public.customers
    FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'sales', 'accountant'));

CREATE POLICY "Customers update policy" ON public.customers
    FOR UPDATE USING (public.get_user_role() IN ('admin', 'sales', 'accountant'));

CREATE POLICY "Customers delete policy" ON public.customers
    FOR DELETE USING (public.get_user_role() = 'admin');

-- PRODUCTS Policies
CREATE POLICY "Products admin full policy" ON public.products
    FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "Products accountant read policy" ON public.products
    FOR SELECT USING (public.get_user_role() = 'accountant');

CREATE POLICY "Products sales read policy" ON public.products
    FOR SELECT USING (public.get_user_role() = 'sales');

-- Note: To strictly prevent sales from reading buying_price at column level, a view or column privileges can be granted:
REVOKE SELECT (buying_price) ON public.products FROM PUBLIC;
GRANT SELECT ON public.products TO authenticated;
-- Column level security for buying_price:
-- In API layer or RPC views, sales receives products with buying_price masked/omitted.

-- QUOTATIONS Policies
CREATE POLICY "Quotations admin full policy" ON public.quotations
    FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "Quotations sales policy" ON public.quotations
    FOR ALL USING (public.get_user_role() = 'sales');

CREATE POLICY "Quotations accountant read policy" ON public.quotations
    FOR SELECT USING (public.get_user_role() = 'accountant');

-- INVOICES Policies
CREATE POLICY "Invoices admin full policy" ON public.invoices
    FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "Invoices accountant full policy" ON public.invoices
    FOR ALL USING (public.get_user_role() = 'accountant');

CREATE POLICY "Invoices sales read policy" ON public.invoices
    FOR SELECT USING (public.get_user_role() = 'sales');

-- DELIVERY SLIPS Policies
CREATE POLICY "Delivery Slips admin full policy" ON public.delivery_slips
    FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "Delivery Slips sales full policy" ON public.delivery_slips
    FOR ALL USING (public.get_user_role() = 'sales');

CREATE POLICY "Delivery Slips accountant read policy" ON public.delivery_slips
    FOR SELECT USING (public.get_user_role() = 'accountant');

-- POS ORDERS Policies
CREATE POLICY "POS Orders admin full policy" ON public.pos_orders
    FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "POS Orders sales full policy" ON public.pos_orders
    FOR ALL USING (public.get_user_role() = 'sales');

CREATE POLICY "POS Orders accountant read policy" ON public.pos_orders
    FOR SELECT USING (public.get_user_role() = 'accountant');

-- LINE ITEMS Policies
CREATE POLICY "Line Items full policy" ON public.line_items
    FOR ALL USING (public.get_user_role() IN ('admin', 'accountant', 'sales'));

-- NOTIFICATION LOGS Policies
CREATE POLICY "Notification Logs full policy" ON public.notification_logs
    FOR ALL USING (public.get_user_role() IN ('admin', 'accountant', 'sales'));
