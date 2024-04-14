// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Locals {}
	interface PageData {
        flash?: {
            type: "success" | "error";
            message: string;
        }
    }
	// interface Error {}
	// interface Platform {}
}
