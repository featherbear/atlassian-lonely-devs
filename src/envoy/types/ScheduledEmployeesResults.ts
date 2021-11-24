export interface ScheduledEmployeesResults {
    data: Data;
}

export interface Data {
    scheduledEmployees: ScheduledEmployees;
}

export interface ScheduledEmployees {
    __typename:                    string;
    pagination:                    Pagination;
    scheduledEmployees:            ScheduledEmployee[];
    hiddenScheduledEmployeesCount: number;
}

export interface Pagination {
    __typename:  string;
    currentPage: number;
    nextPage:    number;
    size:        number;
    total:       number;
}

export interface ScheduledEmployee {
    __typename: string;
    id:         string;
    email:      string;
    name:       string;
    date:       string;
    desk:       Desk;
    employeeId: string;
    scheduled:  boolean;
}

export interface Desk {
    __typename:       string;
    id:               string;
    deskAvailability: string;
    name:             string;
    neighborhood:     string;
    floor:            Floor;
    x:                number | null;
    y:                number | null;
    status:           string;
}

export interface Floor {
    __typename:   string;
    id:           string;
    name:         string;
    building:     null;
    floorPlanUrl: string;
    floorNumber:  number;
}
