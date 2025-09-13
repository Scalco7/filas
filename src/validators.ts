export class Validators{
    private static validateCPF(cpf: string): boolean {
        const cleanCPF = cpf.replace(/\D/g, '');
        if (cleanCPF.length !== 11) return false;

        if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleanCPF[i]) * (10 - i);
        }
        let digit1 = (sum * 10) % 11;
        if (digit1 === 10) digit1 = 0;

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleanCPF[i]) * (11 - i);
        }
        let digit2 = (sum * 10) % 11;
        if (digit2 === 10) digit2 = 0;

        return digit1 === parseInt(cleanCPF[9]) && digit2 === parseInt(cleanCPF[10]);
    }

    private static validatePhone(phone: string): boolean {
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length >= 10 && cleanPhone.length <= 11;
    }

    private static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    public static validateIdentifier(identifier: string, type: 'cpf' | 'phone' | 'email'): { valid: boolean; message?: string } {
        switch (type) {
            case 'cpf':
                const validatedCpf = this.validateCPF(identifier)
                return {
                    valid: validatedCpf,
                    message: validatedCpf ? undefined : 'CPF inválido'
                };
            case 'phone':
                const validatedPhone = this.validatePhone(identifier)
                return {
                    valid: validatedPhone,
                    message: validatedPhone ? undefined : 'Número de celular inválido'
                };
            case 'email':
                const validatedEmail = this.validateEmail(identifier)
                return {
                    valid: validatedEmail,
                    message: validatedEmail ? undefined : 'Email inválido'
                };
            default:
                return { valid: false, message: 'Tipo de identificador inválido' };
        }
    }
}