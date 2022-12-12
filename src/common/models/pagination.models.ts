const getSkipValue = (page_number: number, page_size: number) => {
  if (page_number <= 0 || !page_number) {
    page_number = 1;
  }
  return (page_number - 1) * page_size;
};

export interface IPaginationRepositoryParams {
  skip: number;
  take: number;
}

const defaultPageSize = 30;

export class PaginationParams {
  SkipValue: number;
  TakeValue: number;
  PageSize: number;
  constructor(page_number: number, page_size?: number) {
    const cfg_page_size =
      !page_size || isNaN(page_size) ? defaultPageSize : page_size;
    this.SkipValue = getSkipValue(page_number, cfg_page_size);
    this.TakeValue = cfg_page_size;
    this.PageSize = cfg_page_size;
  }

  asRepositoryParams() {
    return {
      take: this.TakeValue,
      skip: this.SkipValue,
    } as IPaginationRepositoryParams;
  }
}
