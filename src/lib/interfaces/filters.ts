export interface FilterValue {
    name: string;
    slug?: string; // Optional to accommodate both use cases
    numberOfItems: number;
}

export interface FilterProps {
    title: string;
    filterBy:string;
    filterValues: FilterValue[];
}