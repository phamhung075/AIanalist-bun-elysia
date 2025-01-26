import { getStatusText } from "@/_core/config/api-config";
import { PaginationResult } from "../../interfaces/rest.interface";
import { HttpStatusCode } from "../common/HttpStatusCode";
import { StatusCodes } from "../common/StatusCodes";

export class SuccessResponse {
    success: boolean;
    message: string;
    data: any;
    status: HttpStatusCode;
    metadata: any;
    options: any;
    pagination?: PaginationResult<any>;

    constructor({
        message,
        data = {},
        status = HttpStatusCode.OK,
        reasonPhrase = StatusCodes[status].phrase,
        pagination,
        options = {},
    }: {
        message?: string;
        data?: any;
        status?: HttpStatusCode;
        reasonPhrase?: string;
        metadata?: any;
        pagination?: PaginationResult<any>;
        options?: any;
    }) {
        this.success = true;
        this.message = message || reasonPhrase;
        this.data = data;
        this.status = status;
        this.metadata = this.formatMetadata({});
        this.options = options;
        this.pagination = pagination;
    }

    private formatMetadata(metadata: any) {
        const description = StatusCodes[this.status]?.description;
        const documentation = StatusCodes[this.status]?.documentation;
        return {
            description,
            documentation,
            ...metadata,
        };
    }

    setStatus(status: HttpStatusCode) {
        this.status = status;
        this.metadata.code = status;
        this.metadata.status = getStatusText(status);
        return this;
    }

    setMessage(message: string) {
        this.message = message;
        return this;
    }

    setMetadata(metadata: any) {
        this.metadata = { ...this.metadata, ...metadata };
        return this;
    }

    setOptions(options: any) {
        this.options = options;
        return this;
    }

    setResponseTime(startTime?: number) {
        const responseTime = startTime ? `${Date.now() - startTime}ms` : '0ms';
        this.metadata.responseTime = responseTime;
        return this;
    }

    setHeader(headers: Record<string, string | string[]>) {
        if (!this.options.headers) {
            this.options.headers = {};
        }

        Object.entries(headers).forEach(([key, value]) => {
            const normalizedKey = this.normalizeHeaderKey(key);
            
            if (normalizedKey === 'set-cookie') {
                if (!this.options.headers['Set-Cookie']) {
                    this.options.headers['Set-Cookie'] = [];
                }
                
                if (Array.isArray(this.options.headers['Set-Cookie'])) {
                    const newCookies = Array.isArray(value) ? value : [value];
                    this.options.headers['Set-Cookie'] = [
                        ...this.options.headers['Set-Cookie'],
                        ...newCookies
                    ];
                } else {
                    this.options.headers['Set-Cookie'] = Array.isArray(value) ? value : [value];
                }
            } else {
                this.options.headers[key] = value;
            }
        });
    
        return this;
    }

    private normalizeHeaderKey(key: string): string {
        return key.toLowerCase();
    }

    setData(data: any) {
        this.data = data;
        return this;
    }

    getBody() {
        this.preSendHooks();
        return this.formatResponse();
    }

    private preSendHooks() {
        this.metadata.timestamp = new Date().toISOString();
    }

    private formatResponse() {
        const response: any = {
            success: this.success,
            message: this.message,
            pagination: this.pagination,
            metadata: {
                ...this.metadata,
                code: this.status,
                status: getStatusText(this.status),
            },
        };

        // Only add data if it's not an empty object
        if (!this.isEmptyObject(this.data)) {
            response.data = this.data;
        }        

        if (Object.keys(this.options).length > 0) {
            Object.assign(response, { options: this.options });
        }

        return response;
    }

    private isEmptyObject(data: any): boolean {
        return (
            typeof data === 'object' &&
            data !== null &&
            !Array.isArray(data) &&
            Object.keys(data).length === 0
        );
    }
}

// Subclasses remain the same as original
class OkSuccess extends SuccessResponse {
    constructor(params?: {
        message?: string;
        status?: HttpStatusCode;
        metadata?: any;
        options?: any;
        data?: any;
        pagination?: PaginationResult<any>;
    }) {
        super({ ...params, status: params?.status || HttpStatusCode.OK });
    }
}

// Other subclasses (CreatedSuccess, AcceptedSuccess, etc.) remain identical

const _SUCCESS = {
    SuccessResponse,
    OkSuccess,
    // Other subclasses
};

export default _SUCCESS;