// pages/api-docs.tsx
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import dynamic from 'next/dynamic';
import { createSwaggerSpec } from 'next-swagger-doc';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic<{
    spec: any;
}>(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs({ spec }: InferGetStaticPropsType<typeof getStaticProps>) {
    return <SwaggerUI spec={spec} />;
}

export const getStaticProps: GetStaticProps = async () => {
    const spec = createSwaggerSpec({
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Help App API',
                version: '1.0.0',
                description: 'On-demand services backend',
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
                schemas: {
                    UserSignup: {
                        type: 'object',
                        required: ['email', 'password', 'role'],
                        properties: {
                            email: { type: 'string', format: 'email' },
                            password: { type: 'string', minLength: 6 },
                            role: { type: 'string', enum: ['CLIENT', 'PROVIDER'] },
                        },
                    },
                    User: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            email: { type: 'string' },
                            role: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' },
                        },
                    },
                    Service: {
                        type: 'object',
                        required: ['id', 'name', 'createdAt', 'updatedAt'],
                        properties: {
                            id: {
                                type: 'integer',
                            },
                            name: {
                                type: 'string',
                            },
                            createdAt: {
                                type: 'string',
                                format: 'date-time',
                            },
                            updatedAt: {
                                type: 'string',
                                format: 'date-time',
                            },
                        },
                    },

                    Booking: {
                        type: 'object',
                        required: [
                            'id',
                            'clientId',
                            'providerId',
                            'serviceId',
                            'status',
                            'requestedAt',
                            'updatedAt',
                        ],
                        properties: {
                            id: {
                                type: 'integer',
                            },
                            clientId: {
                                type: 'integer',
                                description: 'ID of the client user',
                            },
                            providerId: {
                                type: 'integer',
                                description: 'ID of the provider user',
                            },
                            serviceId: {
                                type: 'integer',
                                description: 'ID of the booked service',
                            },
                            status: {
                                type: 'string',
                                enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'],
                            },
                            requestedAt: {
                                type: 'string',
                                format: 'date-time',
                            },
                            updatedAt: {
                                type: 'string',
                                format: 'date-time',
                            },
                            client: {
                                $ref: '#/components/schemas/User',
                            },
                            provider: {
                                $ref: '#/components/schemas/User',
                            },
                            service: {
                                $ref: '#/components/schemas/Service',
                            },
                            review: {
                                $ref: '#/components/schemas/Review',
                            },
                        },
                    },

                    Review: {
                        type: 'object',
                        required: ['id', 'bookingId', 'rating', 'createdAt'],
                        properties: {
                            id: {
                                type: 'integer',
                            },
                            bookingId: {
                                type: 'integer',
                                description: 'The booking this review belongs to',
                            },
                            rating: {
                                type: 'integer',
                                minimum: 1,
                                maximum: 5,
                                description: 'Rating from 1 to 5',
                            },
                            comment: {
                                type: 'string',
                                description: 'Optional comment',
                            },
                            createdAt: {
                                type: 'string',
                                format: 'date-time',
                            },
                        },
                    },
                },
            },
            security: [{ bearerAuth: [] }],
        },
        apiFolder: 'pages/api',
    });
    return { props: { spec } };
};
