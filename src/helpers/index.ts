import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export const prettyDate = (date: string): string => {
  return format(new Date(date), 'dd MMM y', {
    locale: ptBR,
  });
};

export const prettyDateWithHour = (hour: string): string => {
  return format(new Date(hour), "dd MMM y, à's' HH:mm", {
    locale: ptBR,
  });
};
