import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import TestSelector from './TestSelector';

describe('TestSelector', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('muestra las categorías y permite completar el test', async () => {
    render(<TestSelector currentUser={{ username: 'ana', name: 'Ana' }} />);

    expect(screen.getByText(/Trastornos de depresión/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Trastornos de depresión/i }));

    expect(screen.getByText(/Pregunta 1 de 5/i)).toBeInTheDocument();

    for (let i = 0; i < 5; i += 1) {
      await userEvent.click(screen.getByRole('button', { name: 'Casi siempre' }));
    }

    expect(screen.getByText(/Reporte orientativo/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Depresión/i).length).toBeGreaterThan(0);
    expect(localStorage.getItem('psicoeval_test_history:ana')).toContain('depression');
    expect(screen.getByText(/Historial de tests/i)).toBeInTheDocument();
  });
});
