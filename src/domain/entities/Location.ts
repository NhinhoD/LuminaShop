export interface Province {
  id: string;
  name: string;
  fullName: string;
}

export interface District {
  id: string;
  name: string;
  fullName: string;
  provinceId?: string;
}

export interface Ward {
  id: string;
  name: string;
  fullName: string;
  districtId?: string;
}
