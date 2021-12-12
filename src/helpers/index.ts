import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export const prettyDate = (date: string): string => {
  return format(new Date(date), 'dd MMM y', {
    locale: ptBR,
  });
};
