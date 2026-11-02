create table if not exists public.service_catalog (
  id text primary key,
  name text not null,
  short_name text,
  group_name text,
  sort_order int,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.service_catalog enable row level security;
drop policy if exists catalog_read on public.service_catalog;
create policy catalog_read on public.service_catalog for select to anon, authenticated using (true);

create table if not exists public.service_records (
  owner uuid not null default auth.uid(),
  service text not null references public.service_catalog(id),
  module text not null,
  record_id text not null,
  data jsonb not null default '{}'::jsonb,
  sample boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (owner, service, module, record_id)
);
create index if not exists service_records_owner_service on public.service_records(owner, service);
alter table public.service_records enable row level security;
drop policy if exists sr_own on public.service_records;
create policy sr_own on public.service_records for all to authenticated using (owner = (select auth.uid())) with check (owner = (select auth.uid()));

insert into public.service_catalog (id,name,short_name,group_name,sort_order) values
('ghg','GHG Accounting','GHG','Carbon, climate and product footprint',1),
('nz','Net Zero Carbon','NZ','Carbon, climate and product footprint',2),
('cna','Carbon Neutral Assurance','CNA','Carbon, climate and product footprint',3),
('ea','Energy Audits','EA','Energy, water and waste',4),
('wa','Water Audits','WA','Energy, water and waste',5),
('zwtl','Zero Waste to Landfill','ZWTL','Energy, water and waste',6),
('zld','Zero Liquid Discharge','ZLD','Energy, water and waste',7),
('lca','Life Cycle Assessments','LCA','Carbon, climate and product footprint',8),
('pcf','Product Carbon Footprint','PCF','Carbon, climate and product footprint',9),
('esg','ESG – GRI Standards','ESG','Sustainability reporting',10),
('brsr','BRSR / BRSR Core','BRSR','Sustainability reporting',11),
('esrs','EU CSRD / ESRS Reporting','ESRS','Regulatory & Compliance',12),
('vsme','VSME Sustainability Report (SMEs)','VSME','Sustainability reporting',13),
('sasb','SASB Standards (ISSB industry-based)','SASB','Sustainability reporting',14),
('cbam','EU CBAM Compliance','CBAM','Regulatory & Compliance',15),
('eco','EcoVadis Readiness','ECO','Certification, ratings and documents',16),
('trn','Training','TRN','People and training',17),
('hse','Health & Safety Performance (HSE Management)','HSE','Social & Governance',18),
('fo','Finance Operations','Finance operations','Finance and accounts',19),
('hrp','HR and Workforce Portal','HR portal','People and training',20),
('mkp','Marketing Portal','Marketing portal','Sales and marketing',21),
('sfp','Sales Force Portal','Sales force portal','Sales and marketing',22),
('itp','IT and Security Portal','IT and security portal','Technology, security and legal',23),
('zed','ZED certification (Zero Defect Zero Effect)','ZED','Certification, ratings and documents',24),
('isf','ISO Documents and Certification Folders','ISO folders','Certification, ratings and documents',25),
('tmr','Trademark Registration','Trademark','Technology, security and legal',26),
('wad','Web App Development and AI Integration','Web app development','Technology, security and legal',27),
('isr','ISO 26000 Social Responsibility (Guidance Assessment)','ISO 26000','Sustainability reporting',28),
('tax','Tax Appeals and Scrutiny','Tax appeals','Finance and accounts',29),
('gst','GST Cases','GST','Finance and accounts',30),
('web','Web Development','Web development','Technology, security and legal',31),
('gcc','GCC – Global Carbon Council','GCC','Carbon, climate and product footprint',32),
('vcs','Verra VCS – Verified Carbon Standard','VCS','Carbon, climate and product footprint',33),
('ccp','Carbon Credit Purchase Portal','CCP','Carbon, climate and product footprint',34),
('iscc','ISCC GHG and Sustainability Calculation','ISCC','Carbon, climate and product footprint',35),
('avc','Aviation Carbon Calculation','AVC','Carbon, climate and product footprint',36),
('sbti','SBTi Sustainability Reporting Consultancy','SBTi','Carbon, climate and product footprint',37),
('csddd','EU CSDDD Due Diligence','CSDDD','Regulatory & Compliance',38),
('epr','Extended Producer Responsibility (EPR)','EPR','Regulatory & Compliance',39),
('s3sup','Scope 3 Supplier Engagement','S3SUP','Supply Chain & Scope 3',40),
('sia','Social Impact Assessment','SIA','Social & Governance',41),
('dei','Diversity, Equity & Inclusion Metrics','DEI','Social & Governance',42),
('gova','Governance Assessment','GOV','Social & Governance',43),
('bia','Biodiversity Impact Assessment','BIA','Biodiversity & Land',44),
('lrp','Land Restoration Planning','LRP','Biodiversity & Land',45),
('tnfd','TNFD Disclosure','TNFD','Biodiversity & Land',46),
('efl','Emission Factor Library','EFL','Analytical Tools',47),
('csa','Climate Scenario Analysis','CSA','Analytical Tools',48),
('sga','Sustainability Gap Analysis','SGA','Analytical Tools',49)
on conflict (id) do update set name=excluded.name, short_name=excluded.short_name, group_name=excluded.group_name, sort_order=excluded.sort_order, active=true, updated_at=now();
update public.service_catalog set active=false where id not in ('ghg','nz','cna','ea','wa','zwtl','zld','lca','pcf','esg','brsr','esrs','vsme','sasb','cbam','eco','trn','hse','fo','hrp','mkp','sfp','itp','zed','isf','tmr','wad','isr','tax','gst','web','gcc','vcs','ccp','iscc','avc','sbti','csddd','epr','s3sup','sia','dei','gova','bia','lrp','tnfd','efl','csa','sga');
