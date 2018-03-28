import * as Sequelize from "sequelize";
import { ModelsInterface } from "./ModelsInterface";

// interface que vai lidar com a nossa conexão com o DB
export interface DbConnection extends ModelsInterface {
  sequelize: Sequelize.Sequelize
}