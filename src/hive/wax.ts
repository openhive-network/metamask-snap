import { createWaxFoundation, type IWaxBaseInterface } from "@hiveio/wax";

let _wax: undefined | IWaxBaseInterface;
export const getWax = async (): Promise<IWaxBaseInterface> => {
  if (!_wax)
    _wax = await createWaxFoundation();

  return _wax;
};
