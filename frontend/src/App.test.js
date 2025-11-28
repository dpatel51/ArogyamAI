import { render, screen } from '@testing-library/react';
import App from './App';

test('renders hospital management system', () => {
    render(<App />);
    const linkElement = screen.getByText(/Hospital Management System/i);
    expect(linkElement).toBeInTheDocument();
});
