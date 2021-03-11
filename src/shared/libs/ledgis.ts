import { GraphQLClient } from "graphql-request";
import { print, DocumentNode } from "graphql";
import gql from "graphql-tag";
import { IGetActionTraceInput, IActionInfo } from "@shared/interfaces/ledgis";

async function req<T1, T2>(args: {
    endpoint: string;
    query: DocumentNode;
    variables?: T2;
}): Promise<T1> {
    return await new GraphQLClient(args.endpoint, {
        headers: {},
    }).request<T1>(print(args.query), args.variables);
}

export async function getActionTrace(
    data: IGetActionTraceInput
): Promise<IActionInfo[]> {
    return (
        await req<any, any>({
            endpoint: `https://api2.ledx.io/hasura/v1/graphql`,
            query: gql`
                query Query(
                    $code: String
                    $action: String
                    $receiver: String
                    $offset: Int
                    $limit: Int
                ) {
                    chain_action_trace(
                        where: {
                            act_account: { _eq: $code }
                            act_name: { _eq: $action }
                            receiver: { _eq: $receiver }
                        }
                        order_by: { block_num: desc }
                        offset: $offset
                        limit: $limit
                    ) {
                        block_info {
                            block_num
                            timestamp
                        }
                        transaction_id
                        act_account
                        act_data
                        act_name
                        action_auth {
                            actor
                            permission
                        }
                    }
                }
            `,
            variables: {
                ...data,
            },
        })
    ).chain_action_trace.map(value => {
        return {
            blockNum: value.block_info.block_num,
            timestamp: value.block_info.timestamp,
            transactionId: value.transaction_id,
            code: value.act_account,
            action: value.act_name,
            dataHex: String(value.act_data).substr(2),
            permission: `${value.action_auth.actor}@${value.action_auth.permission}`,
        };
    });
}

export async function getTrasactionDetail(transactionId: string): Promise<any> {
    return (
        await req<any, any>({
            endpoint: `https://api2.ledx.io/hasura/v1/graphql`,
            query: gql`
                query MyQuery($transactionId: String!) {
                    chain_transaction_trace(
                        where: { id: { _eq: $transactionId } }
                    ) {
                        block_info {
                            block_num
                            timestamp
                        }
                        status
                        action_trace(distinct_on: action_ordinal) {
                            act_account
                            act_name
                            act_data
                            action_ordinal
                            action_auth {
                                actor
                                permission
                            }
                        }
                    }
                }
            `,
            variables: {
                transactionId,
            },
        })
    ).chain_transaction_trace[0];
}
