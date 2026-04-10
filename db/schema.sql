create type user_role as enum ('OWNER', 'ASSISTANT', 'BOOKKEEPER');
create type client_type as enum ('INDIVIDUAL', 'EMPLOYER', 'LAW_FIRM', 'TITLE_COMPANY', 'HOSPITAL', 'FACILITY', 'OTHER');
create type contact_method as enum ('SMS', 'EMAIL', 'PHONE');
create type appointment_channel as enum ('EMPLOYER', 'PRIVATE');
create type service_mode as enum ('IN_PERSON', 'ELECTRONIC_IN_PERSON', 'RON');
create type facility_type as enum ('OFFICE', 'HOME', 'HOSPITAL', 'NURSING_HOME', 'HOSPICE', 'JAIL_DETENTION', 'TITLE_AUTO', 'REAL_ESTATE', 'EMPLOYER_INTERNAL', 'ONLINE', 'OTHER');
create type appointment_status as enum ('LEAD', 'AWAITING_DOCUMENTS', 'AWAITING_ID_CONFIRMATION', 'QUOTED', 'BOOKED', 'EN_ROUTE', 'SIGNER_NOT_READY', 'COMPLETED', 'REFUSED', 'CANCELLED', 'NO_SHOW', 'FOLLOW_UP_NEEDED');
create type compliance_severity as enum ('INFO', 'WARNING', 'BLOCK');
create type journal_mode as enum ('TRADITIONAL', 'RON');
create type payment_status as enum ('DRAFT', 'SENT', 'PAID', 'VOID');
create type review_channel as enum ('SMS', 'EMAIL');
create type session_status as enum ('PENDING', 'ACTIVE', 'COMPLETED', 'ABORTED');
create type portal_auth_provider as enum ('MAGIC_LINK', 'SMS_OTP', 'CLERK', 'SUPABASE');
create type payment_provider as enum ('STRIPE', 'MANUAL');
create type payment_intent_status as enum ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED');
create type client_message_sender_type as enum ('NOTARY', 'CLIENT', 'SYSTEM');
create type client_message_type as enum ('BOOKING_CONFIRMATION', 'REMINDER', 'MISSING_INFO_REQUEST', 'UPLOAD_REQUEST', 'QUOTE_ACCEPTED', 'INVOICE_SENT', 'APPOINTMENT_FOLLOW_UP', 'REVIEW_REQUEST', 'REPEAT_CLIENT_OUTREACH');
create type launch_phase as enum ('COMMISSION', 'OPERATIONS', 'RON', 'BUSINESS', 'REVENUE_SCALE');
create type launch_milestone_status as enum ('LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED');
create type launch_milestone_source_type as enum ('MANUAL', 'DERIVED');
create type launch_task_status as enum ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED');
create type goal_period_type as enum ('MONTH', 'QUARTER');

create table users (
  id text primary key,
  email text not null unique,
  role user_role not null default 'OWNER',
  created_at timestamptz not null default now()
);

create table notary_profiles (
  id text primary key,
  user_id text not null unique references users(id) on delete cascade,
  legal_name text not null,
  commission_number text not null,
  commission_issue_date date not null,
  commission_expiration_date date not null,
  ron_authorized boolean not null default false,
  ron_issue_date date,
  ron_expiration_date date,
  oath_completed boolean not null default false,
  bci_date date,
  commission_approved_date date,
  base_city text not null,
  base_county text not null,
  business_mode_enabled boolean not null default true,
  employer_mode_enabled boolean not null default true,
  business_entity_type text,
  business_entity_name text,
  ein_status boolean not null default false,
  seal_ordered boolean not null default false,
  seal_received_date date,
  journal_type_configured text,
  e_seal_configured boolean not null default false,
  e_signature_configured boolean not null default false,
  ron_platform_configured boolean not null default false,
  initial_education_completed boolean not null default false,
  ron_education_completed boolean not null default false,
  initial_application_filed boolean not null default false,
  ron_application_filed boolean not null default false,
  initial_provider_fee_reference integer not null default 130,
  ron_provider_fee_reference integer not null default 250,
  initial_filing_fee_reference integer not null default 15,
  ron_filing_fee_reference integer not null default 20,
  llc_formed boolean not null default false,
  llc_formed_date date,
  ein_obtained_date date,
  business_banking_ready boolean not null default false,
  eo_insurance_active boolean not null default false,
  eo_insurance_renewal_date date,
  google_business_profile_live boolean not null default false,
  website_live boolean not null default false,
  employer_private_separation_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table travel_zones (
  id text primary key,
  code text not null unique,
  label text not null,
  min_miles numeric(6,2) not null,
  max_miles numeric(6,2),
  base_fee integer not null,
  zip_codes jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table clients (
  id text primary key,
  type client_type not null default 'INDIVIDUAL',
  name text not null,
  email text unique,
  phone text,
  preferred_contact_method contact_method not null default 'SMS',
  referral_source text,
  notes text,
  created_at timestamptz not null default now()
);

create table appointments (
  id text primary key,
  client_id text not null references clients(id) on delete cascade,
  channel appointment_channel not null,
  service_mode service_mode not null,
  service_type text not null,
  document_type text not null,
  facility_type facility_type not null,
  status appointment_status not null default 'LEAD',
  requested_at timestamptz not null default now(),
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  address_line_1 text,
  city text,
  state text default 'OH',
  zip text,
  travel_miles numeric(6,2),
  urgent_level text,
  after_hours boolean not null default false,
  special_instructions text,
  compliance_status text default 'pending',
  refusal_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table signers (
  id text primary key,
  appointment_id text not null references appointments(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  id_method text,
  id_type text,
  id_expiration_date date,
  personal_knowledge boolean not null default false,
  address text,
  appeared_in_person boolean not null default false,
  appeared_by_ron boolean not null default false,
  credential_analysis_passed boolean not null default false,
  identity_proofing_passed boolean not null default false,
  signature_captured boolean not null default false,
  notes text
);

create table notarial_acts (
  id text primary key,
  appointment_id text not null references appointments(id) on delete cascade,
  signer_id text not null references signers(id) on delete cascade,
  act_type text not null,
  act_count integer not null,
  certificate_type text,
  document_title text not null,
  completed_at timestamptz,
  refused_at timestamptz,
  completion_status text not null,
  seal_applied boolean not null default false,
  signature_applied boolean not null default false,
  notes text
);

create table quotes (
  id text primary key,
  appointment_id text not null unique references appointments(id) on delete cascade,
  traditional_act_fee integer not null default 0,
  ron_act_fee integer not null default 0,
  technology_fee integer not null default 0,
  travel_fee integer not null default 0,
  after_hours_fee integer not null default 0,
  specialty_fee integer not null default 0,
  printing_fee integer not null default 0,
  total integer not null,
  travel_fee_disclosed boolean not null default false,
  travel_fee_accepted boolean not null default false,
  blocked boolean not null default false,
  block_reason text,
  created_at timestamptz not null default now()
);

create table invoices (
  id text primary key,
  appointment_id text not null unique references appointments(id) on delete cascade,
  invoice_number text not null unique,
  subtotal integer not null,
  total integer not null,
  payment_status payment_status not null default 'DRAFT',
  payment_method text,
  paid_at timestamptz,
  exported_at timestamptz,
  notes text
);

create table journal_entries (
  id text primary key,
  appointment_id text not null references appointments(id) on delete cascade,
  mode journal_mode not null,
  entry_data_json jsonb not null,
  tamper_hash text not null,
  chronological_index integer not null,
  completed_at timestamptz,
  export_status text,
  created_at timestamptz not null default now()
);

create table ron_sessions (
  id text primary key,
  appointment_id text not null unique references appointments(id) on delete cascade,
  platform_name text not null,
  session_url text,
  audio_video_verified boolean not null default false,
  credential_analysis_verified boolean not null default false,
  identity_proofing_verified boolean not null default false,
  recording_url text,
  recording_saved_at timestamptz,
  tech_fee_charged integer not null default 0,
  session_status session_status not null default 'PENDING',
  failure_reason text
);

create table compliance_flags (
  id text primary key,
  appointment_id text not null references appointments(id) on delete cascade,
  severity compliance_severity not null,
  code text not null,
  message text not null,
  resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table review_requests (
  id text primary key,
  appointment_id text not null references appointments(id) on delete cascade,
  channel review_channel not null,
  sent_at timestamptz,
  response_tracked boolean not null default false,
  review_url text
);

create table mileage_logs (
  id text primary key,
  appointment_id text not null unique references appointments(id) on delete cascade,
  miles numeric(6,2) not null,
  start_odometer numeric(8,1),
  end_odometer numeric(8,1),
  purpose text
);

create table audit_logs (
  id text primary key,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  actor_id text references users(id) on delete set null,
  created_at timestamptz not null default now(),
  metadata_json jsonb
);

create table public_leads (
  id text primary key,
  client_id text references clients(id) on delete set null,
  source text not null,
  landing_page text not null,
  service_mode_requested text not null,
  document_type text not null,
  urgency_level text not null,
  location_type text not null,
  zip text,
  quoted boolean not null default false,
  booked boolean not null default false,
  created_at timestamptz not null default now()
);

create table portal_users (
  id text primary key,
  client_id text not null references clients(id) on delete cascade,
  email text not null unique,
  phone text,
  auth_provider portal_auth_provider not null default 'MAGIC_LINK',
  created_at timestamptz not null default now()
);

create table portal_sessions (
  id text primary key,
  portal_user_id text not null references portal_users(id) on delete cascade,
  last_login_at timestamptz,
  device_meta jsonb,
  created_at timestamptz not null default now()
);

create table document_uploads (
  id text primary key,
  appointment_id text not null references appointments(id) on delete cascade,
  uploaded_by_portal_user_id text not null references portal_users(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  mime_type text not null,
  reviewed boolean not null default false,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

create table booking_disclosures (
  id text primary key,
  appointment_id text not null unique references appointments(id) on delete cascade,
  travel_fee_accepted boolean not null default false,
  cancellation_policy_accepted boolean not null default false,
  privacy_policy_accepted boolean not null default false,
  portal_terms_accepted boolean not null default false,
  accepted_at timestamptz,
  accepted_ip text,
  created_at timestamptz not null default now()
);

create table client_messages (
  id text primary key,
  appointment_id text not null references appointments(id) on delete cascade,
  sender_type client_message_sender_type not null,
  message_type client_message_type not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table portal_checklist_items (
  id text primary key,
  appointment_id text not null references appointments(id) on delete cascade,
  type text not null,
  label text not null,
  completed boolean not null default false,
  completed_at timestamptz
);

create table payment_intents (
  id text primary key,
  appointment_id text not null references appointments(id) on delete cascade,
  invoice_id text,
  provider payment_provider not null,
  amount integer not null,
  status payment_intent_status not null default 'PENDING',
  created_at timestamptz not null default now()
);

create table landing_page_stats (
  id text primary key,
  slug text not null,
  visits integer not null default 0,
  conversions integer not null default 0,
  created_at timestamptz not null default now()
);

create table launch_milestones (
  id text primary key,
  phase launch_phase not null,
  code text not null unique,
  title text not null,
  description text not null,
  status launch_milestone_status not null,
  due_date timestamptz,
  completed_at timestamptz,
  sort_order integer not null,
  dependency_codes jsonb,
  blocker_reason text,
  owner_notes text,
  source_type launch_milestone_source_type not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table launch_tasks (
  id text primary key,
  milestone_id text not null references launch_milestones(id) on delete cascade,
  title text not null,
  status launch_task_status not null default 'PENDING',
  completed_at timestamptz,
  requires_manual_confirmation boolean not null default false,
  evidence_type text not null,
  evidence_value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table launch_alerts (
  id text primary key,
  code text not null unique,
  severity compliance_severity not null,
  title text not null,
  body text not null,
  related_milestone_id text references launch_milestones(id) on delete set null,
  due_date timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table goals (
  id text primary key,
  period_type goal_period_type not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  revenue_target integer not null,
  appointment_target integer not null,
  ron_target integer not null,
  mobile_target integer not null,
  review_target integer not null,
  b2b_outreach_target integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table goal_snapshots (
  id text primary key,
  goal_id text not null references goals(id) on delete cascade,
  actual_revenue integer not null,
  actual_appointments integer not null,
  actual_ron integer not null,
  actual_mobile integer not null,
  actual_reviews integer not null,
  actual_b2b_outreach integer not null,
  updated_at timestamptz not null default now()
);
