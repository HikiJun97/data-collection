import TimeElement from "./TimeElement";

declare global {
	interface HTMLElementTagNameMap {
		"time-element": TimeElement;
	}
	interface Window {
		fromPath?: string;
	}

	interface User {
		id: string;
		data: Array<Datum>;
	}

	interface Datum {
		id: string;
		video_id: string;
		start_time: string;
		end_time: string;
		valid: boolean;
		validated: boolean;
		validator: string;
		type: string;
		gender: string;
		age: string;
	}
}
