declare class TomSelect {
	constructor(element: string | HTMLElement, settings?: any);
	getValue(): string | null;
	addOptions: any;
	on: any;
	clearOptions: any;
}

interface HTMLSelectElement {
	tomselect: TomSelect;
}
