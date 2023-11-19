import { Cemetery } from "./CemeteryInterfaces";
import { GraveType } from "./GraveTypeInterfaces";

export interface GraveData {
  _id: string;
  number: string;
  field: string;
  row: string;
  capacity: string;
  contractTo: string;
  LAT: string;
  LON: string;
  numberOfDeceaseds: string;
  graveType: GraveType;
}

export interface Deceased {
  _id: string;
  name: string;
  surname: string;
  grave: GraveData;
  dateBirth: string;
  dateDeath: string;
}

export interface Payer {
  _id: string;
  name: string;
  surname: string;
  grave: string;
  address: string;
  phone: string;
  jmbg: number;
  active: boolean;
}

export interface Grave {
  _id: string;
  number: string;
  field: string;
  row: string;
  contractTo: string;
  LAT: string;
  LON: string;
  deceased: Deceased[];
  payers: Payer[];
  graveType: GraveType;
  cemetery: Cemetery;
}
