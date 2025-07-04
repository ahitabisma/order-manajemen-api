export interface PagingRequest {
    page?: number;
    size?: number;
}

export interface Paging {
    size: number;
    total_page: number;
    current_page: number;
    total_data: number;
}

export interface Pageable<T> {
    data: T[];
    paging: Paging;
}
