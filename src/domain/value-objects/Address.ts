export type Region = 'EU' | 'USA' | 'OTHER';

export interface AddressProps {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
}

export class Address {
  private static readonly EU_COUNTRIES = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  ];

  private constructor(
    public readonly street: string,
    public readonly city: string,
    public readonly state: string,
    public readonly country: string,
    public readonly postalCode: string,
    public readonly phone: string
  ) {
    this.validate();
  }

  static create(props: AddressProps): Address {
    return new Address(
      props.street,
      props.city,
      props.state,
      props.country,
      props.postalCode,
      props.phone
    );
  }

  getRegion(): Region {
    const countryCode = this.country.toUpperCase();

    if (countryCode === 'US' || countryCode === 'USA') {
      return 'USA';
    }

    if (Address.EU_COUNTRIES.includes(countryCode)) {
      return 'EU';
    }

    return 'OTHER';
  }

  private validate(): void {
    if (!this.street || this.street.trim() === '') {
      throw new Error('Street is required');
    }
    if (!this.city || this.city.trim() === '') {
      throw new Error('City is required');
    }
    if (!this.country || this.country.trim() === '') {
      throw new Error('Country is required');
    }
    if (!this.postalCode || this.postalCode.trim() === '') {
      throw new Error('Postal code is required');
    }
    if (!this.phone || this.phone.trim() === '') {
      throw new Error('Phone is required');
    }
  }

  toJSON() {
    return {
      street: this.street,
      city: this.city,
      state: this.state,
      country: this.country,
      postalCode: this.postalCode,
      phone: this.phone,
    };
  }
}
