export interface Bank {
  id: string;
  name: string;
  shortName?: string;
  logoColor?: string;
}

export const TURKISH_BANKS: Bank[] = [
  { id: 'akbank', name: 'Akbank', logoColor: '#ee3124' },
  { id: 'albaraka', name: 'Albaraka Türk', logoColor: '#a81c84' },
  { id: 'anadolubank', name: 'Anadolubank', logoColor: '#008fd5' },
  { id: 'denizbank', name: 'Denizbank', logoColor: '#0059b4' },
  { id: 'fibabanka', name: 'Fibabanka', logoColor: '#640c0c' },
  { id: 'garanti', name: 'Garanti BBVA', shortName: 'Garanti', logoColor: '#00a6d6' },
  { id: 'halkbank', name: 'Halkbank', logoColor: '#015eab' },
  { id: 'hsbc', name: 'HSBC', logoColor: '#db0011' },
  { id: 'ing', name: 'ING Bank', shortName: 'ING', logoColor: '#ff6200' },
  { id: 'isbank', name: 'İş Bankası', logoColor: '#0056a4' },
  { id: 'kuveytturk', name: 'Kuveyt Türk', logoColor: '#3c3c3c' },
  { id: 'odeabank', name: 'Odeabank', logoColor: '#ec008c' },
  { id: 'qnb', name: 'QNB Finansbank', shortName: 'QNB', logoColor: '#681e7e' },
  { id: 'sekerbank', name: 'Şekerbank', logoColor: '#ea4949' },
  { id: 'teb', name: 'TEB', logoColor: '#5bc5f2' },
  { id: 'turkiyefinans', name: 'Türkiye Finans', logoColor: '#9c8031' },
  { id: 'vakifbank', name: 'Vakıfbank', logoColor: '#00529b' },
  { id: 'yapikredi', name: 'Yapı Kredi', logoColor: '#010e6f' },
  { id: 'ziraat', name: 'Ziraat Bankası', shortName: 'Ziraat', logoColor: '#c51f36' },
  { id: 'other', name: 'Other Bank', logoColor: '#6b7280' }
];

export function getBankById(id: string): Bank | undefined {
  return TURKISH_BANKS.find(bank => bank.id === id);
}

export function getBankColor(bankId: string): string {
  const bank = getBankById(bankId);
  return bank?.logoColor || '#6b7280'; // Default gray color if not found
}

export function getBankName(bankId: string): string {
  const bank = getBankById(bankId);
  return bank?.name || bankId; // Return ID as fallback if not found
}

export function getBankShortName(bankId: string): string {
  const bank = getBankById(bankId);
  return bank?.shortName || bank?.name || bankId; // Return full name or ID as fallback
}