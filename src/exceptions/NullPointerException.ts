export class NullPointerException extends Error {
    constructor(
        private target: string
    ) {
        super();
        this.name = "NullPointerException";
    }

    public get message(): string {
        return `${this.target} is null`;
    }
}
