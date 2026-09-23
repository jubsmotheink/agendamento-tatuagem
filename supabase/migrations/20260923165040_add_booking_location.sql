alter table public.agendamentos
  add column unidade text not null default 'barra-guaratiba';

alter table public.agendamentos
  add constraint agendamentos_unidade_check
  check (unidade in (
    'barra-guaratiba',
    'copacabana-barata-ribeiro',
    'copacabana-djalma-ulrich'
  ));

comment on column public.agendamentos.unidade is
  'Local de atendimento escolhido pelo cliente. A disponibilidade permanece global entre todas as unidades.';
