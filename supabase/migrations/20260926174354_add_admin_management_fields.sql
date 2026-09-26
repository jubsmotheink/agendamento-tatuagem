alter table public.agendamentos
  add column atendimento_status text not null default 'agendado',
  add column valor_sinal numeric(10, 2) not null default 50,
  add column valor_total numeric(10, 2),
  add column valor_recebido numeric(10, 2) not null default 0,
  add column forma_pagamento text,
  add column observacoes text,
  add column atendido_em timestamp with time zone;

update public.agendamentos
set valor_recebido = valor_sinal
where pagamento_status = 'aprovado';

alter table public.agendamentos
  add constraint agendamentos_atendimento_status_check
    check (atendimento_status in ('agendado', 'atendido', 'nao_compareceu')),
  add constraint agendamentos_valor_sinal_check check (valor_sinal >= 0),
  add constraint agendamentos_valor_total_check
    check (valor_total is null or valor_total >= 0),
  add constraint agendamentos_valor_recebido_check check (valor_recebido >= 0);

comment on column public.agendamentos.atendimento_status is
  'Resultado operacional do atendimento, separado do status da reserva.';
comment on column public.agendamentos.valor_recebido is
  'Total efetivamente recebido, incluindo o sinal.';
comment on column public.agendamentos.observacoes is
  'Anotações internas visíveis somente no painel administrativo.';
