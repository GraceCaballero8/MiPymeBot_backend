import { IProductCreate } from './product-create.interface';

export interface IProductUpdate extends Partial<IProductCreate> {}
