import * as graphqlFields from 'graphql-fields'
import { difference, union } from 'lodash';
import { GraphQLResolveInfo } from "graphql";

export class RequestedFields {

  /**
   * Help us to fetch only what the client requests
   * @param info 
   * @param options 
   */
  getFields(info: GraphQLResolveInfo, options?: {keep?: string[], exclude?: string[]}): string[] {
    // return an array with the keys of the upper level of the object;
  let fields: string[] = Object.keys(graphqlFields(info));
  if (!options) { return fields; }

  //join the arrays if the keep attributes has something
  fields = (options.keep) ? union<string>(fields, options.keep) : fields;

  return (options.exclude) 
    ? difference<string>(fields, options.exclude) 
    : fields;
  }
}

