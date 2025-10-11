export type User = {
  id: string;
  name: string;
  email: string;
  firstname: string,
  lastname: string,
  role: "CLIENT" | "CLEANER" | "ADMIN"
  imageUrl: string;
  imageFullUrl: string;
  activeSubscription?: ICommand | null
};

export type IAddress = {
  arrondissement: string,
  description?: string
  commune: string,
  contactFullname: string,
  contactPhone: string,
  department: string,
  country: string,
  quartier: string,
  userId: string,
  addLocation?: boolean,
  coordinates?: {
    longitude: string,
    latitude: string
  }
}

export interface IOrder {
  id: number,
  invoiceId:number,
  invoice:IInvoice,
  orderId:string,
  pickingHours: [string, string]
  executionDuration?:number,
  orderTitle:string,
  status: "CREATED" | "STARTED" | "PICKED" | "WASHING" | "DELIVERED" | "CANCELED"|"READY"
  deliveryDate: string
  hasStarted?:boolean,
  capacityKg: number
  userKg?: number
  customerOrderKgPrice?:number,
  commandExecutionIndex: number
  orderExecutionIndex: number
  addons?: { [x: string]: { unitCost: number, totalCost: number } }
  initialExecutionCost?: number
  finalExecutionCost?: number
  toPayExecutionFees?: number
  merchantKgCost?: number
  deliveryCost: number
  merchantTotalCost?: number
  deliveryType: "SHIPPING_DEFAULT" | "SHIPPING_FAST" | "SHIPPING_PRIORITIZED"
  executionDate: string
  commandId: number
  command: ICommand
  userId: number
  user: IUser
  merchantId?: number
  createdAt: string
  package:IPackage,
  updatedAt: string
  orderType:"SUBSCRIPTION"| "COMMAND"
}

export type IPackage = {
  amount: number;
  code: "LESSIVE_FAMILLE" | "LESSIVE_COUPLE" | "LESSIVE_CELIBATAIRE" | "LESSIVE_UNIQUE";
  createdAt: string;
  id: number;
  kg: string;
  meta: {
    nombreDeJoursDeVetementMax: number;
    nombreDeJoursDeVetementMin: number;
    nombreDePersonnesMax: number;
    nombreDePersonnesMin: number;
  };
  name: string;
  updatedAt: string;
}
export interface IServiceMeta {
  id: string,
  key: string,
  code: string
  name: string,
  price: string,
  value: {
    timeDurationApprox?: string
  }
}
export type Addons = {
  shippings: { [x: string]: IServiceMeta },
  drying: IServiceMeta,
  pickingMultiple: IServiceMeta
}
export interface IUser {

}
export interface IInvoice {
  id: number;
  invoiceType: "SUBSCRIPTION_LAUNDRY" | "COMMAND_LAUNDRY" | "SUBSCRIPTION_OVERWEIGHT";
  amount: string;
  paymentHash: string;
  status: "CREATED" | "PENDING" | "SUCCESS" | "FAILED";
  userId: number;
  user: IUser;
  createdAt: string;
  updatedAt: string;
}
export interface ICommand {
  id: number;
  commandType: string;
  commandDescription:string,
  packageId: number,
  totalExecution: number;
  nextOrderAt: string;
  package: IPackage;
  isPaid: boolean;
  userId: number;
  user: IUser,
  invoiceId: number;
  invoice: IInvoice;
  pickingDaysTimes: [number, [string, string]][],
  isActive: boolean;
  price: string;
  executionCount: number;
  startAt: string;
  endAt: string;
  createdAt: string;
  updatedAt: string;
}