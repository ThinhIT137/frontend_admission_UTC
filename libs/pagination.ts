export type paginationRequest = {
    page: number;
    pageSize: number;
};

export type paginationResponse = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};
