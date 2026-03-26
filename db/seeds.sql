insert into travel_zones (id, code, label, min_miles, max_miles, base_fee, zip_codes)
values
  ('tz_local', 'local', 'Columbus core (0-10 miles)', 0, 10, 30, '["43215","43201","43212","43220"]'::jsonb),
  ('tz_metro', 'metro', 'Franklin County metro (10-20 miles)', 10.01, 20, 35, '["43224","43229","43235","43123"]'::jsonb),
  ('tz_extended', 'extended', 'Extended service area (20-30 miles)', 20.01, 30, 50, '["43004","43017","43085"]'::jsonb),
  ('tz_custom', 'custom', 'Custom quote (30+ miles)', 30.01, null, 65, '[]'::jsonb);

insert into users (id, email, role)
values ('user_owner', 'owner@ohionotaryos.local', 'OWNER');

insert into notary_profiles (
  id,
  user_id,
  legal_name,
  commission_number,
  commission_issue_date,
  commission_expiration_date,
  ron_authorized,
  ron_issue_date,
  ron_expiration_date,
  oath_completed,
  bci_date,
  base_city,
  base_county,
  business_mode_enabled,
  employer_mode_enabled,
  business_entity_type,
  business_entity_name,
  ein_status,
  seal_ordered,
  journal_type_configured,
  e_seal_configured,
  e_signature_configured,
  ron_platform_configured,
  initial_education_completed,
  ron_education_completed,
  initial_application_filed,
  ron_application_filed
)
values (
  'profile_owner',
  'user_owner',
  'Kerri Ann Lark',
  'OH-2026-0001',
  '2026-03-01',
  '2031-03-01',
  true,
  '2026-03-10',
  '2031-03-01',
  true,
  '2026-02-15',
  'Columbus',
  'Franklin',
  true,
  true,
  'LLC',
  'Ohio Notary OS LLC',
  true,
  true,
  'hybrid',
  true,
  true,
  true,
  true,
  true,
  true,
  true
);

insert into landing_page_stats (id, slug, visits, conversions)
values
  ('landing_001', 'columbus-mobile-notary', 420, 41),
  ('landing_002', 'remote-online-notary-ohio', 385, 33),
  ('landing_003', 'hospital-notary-columbus', 145, 19);
