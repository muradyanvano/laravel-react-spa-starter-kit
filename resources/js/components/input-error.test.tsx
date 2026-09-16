import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import InputError from '@/components/input-error';
import { fieldDescribedBy, fieldErrorId } from '@/hooks/use-form';

describe('InputError', () => {
    it('renders nothing when there is no message', () => {
        const { container } = render(<InputError message={undefined} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('renders the message with a stable error id for aria association', () => {
        render(
            <InputError
                id={fieldErrorId('name')}
                message="The name field is required."
            />,
        );

        const error = screen.getByText('The name field is required.');

        expect(error).toHaveAttribute('id', 'name-error');
        expect(error.tagName).toBe('P');
    });
});

describe('field accessibility helpers', () => {
    it('builds stable error ids and described-by values', () => {
        expect(fieldErrorId('email')).toBe('email-error');
        expect(fieldDescribedBy('email', {})).toBeUndefined();
        expect(
            fieldDescribedBy('email', {
                email: 'The email field is required.',
            }),
        ).toBe('email-error');
    });
});
