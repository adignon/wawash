export type User = {
  id: string;
  name: string;
  email: string;
  firstname: string,
  lastname: string,
  imageUrl: string;
  imageFullUrl:string
};

export type IAddress = {
  arrondissement: string,
  description?:string
  commune: string,
  contactFullname: string,
  contactPhone: string,
  departement: string,
  country: string,
  quartier: string,
  userId: string,
  addLocation?:boolean,
  coordinates?: {
    longitude:string,
    latitude:string
  }
}