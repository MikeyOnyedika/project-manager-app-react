import mysql from "mysql";
import dotenv from "dotenv";
dotenv.config();

class BaseDb {
     #connection;

     constructor() {
          if (
               process.env.DB_NAME == null ||
               process.env.DB_USER == null ||
               process.env.DB_USER_PASSWORD == null
          ) {
               throw new Error(
                    "You have not created a .env file in your project root or maybe you have not declared 'DB_NAME' or 'DB_USER' or 'DB_USER_PASSWORD' in the .env file"
               );
          }
          this.#connection = mysql.createConnection({
               host: "localhost",
               user: process.env.DB_USER,
               password: process.env.DB_USER_PASSWORD,
               database: process.env.DB_NAME,
          });
          this.#connection.connect();
          this.createTables();
     }

     getConnection() {
          return this.#connection;
     }

     async createTables() {
          const createProjectTable = {
               query: `CREATE TABLE IF NOT EXISTS project (id VARCHAR(20)  PRIMARY KEY, 
                                                    name VARCHAR(300) NOT NULL,
                                                    date_created DATE NOT NULL DEFAULT(CURRENT_DATE)
                                                    )`,
               tableName: "project",
          };

          const createBoardTable = {
               query: `CREATE TABLE IF NOT EXISTS board (id VARCHAR(20) PRIMARY KEY, 
                                                    title VARCHAR(300) NOT NULL,
                                                    project_id VARCHAR(20) NOT NULL,
                                                    date_created DATE NOT NULL DEFAULT(CURRENT_DATE)
                                                )`,
               tableName: "board",
          };

          const createCardTable = {
               query: `CREATE TABLE IF NOT EXISTS card (id VARCHAR(20) PRIMARY KEY, 
                                                    description TEXT NOT NULL,
                                                    board_id VARCHAR(20) NOT NULL,
                                                    is_completed BOOLEAN NOT NULL DEFAULT(FALSE)
                                                )`,
               tableName: "card",
          };

          const queryList = [
               createProjectTable,
               createBoardTable,
               createCardTable,
          ];

          try {
               const isTablesCreated = await this.runQueryList(queryList);
               console.log(isTablesCreated);
          } catch (err) {
               throw new Error("Make sure your database server is running and that you created the database using the appropriate credientials" + err);
          }
     }

     runQueryList(queryList) {
          return new Promise(async (resolve, reject) => {
               for (let i = 0; i < queryList.length; i++) {
                    try {
                         const result = await this.run(queryList[i]);
                    } catch (err) {
                         reject(err);
                         return;
                    }
               }
               resolve("tables created successfully");
          });
     }

     run(query) {
          return new Promise((resolve, reject) => {
               this.#connection.query(query.query, (error, result) => {
                    if (!error) {
                         resolve(true);
                    } else {
                         reject(
                              `${query.tableName} table not created.  ${error}. Check your database connection!`
                         );
                    }
               });
          });
     }

     getProjectBoards(projectId) {
          return new Promise((resolve, reject) => {
               const query = `SELECT * FROM board WHERE project_id = ?`;
               this.#connection.query(query, [projectId], (error, result) => {
                    if (!error) {
                         result = result.map((board) => {
                              return {
                                   id: board.id,
                                   title: board.title,
                                   dateCreated: board.date_created,
                                   projectId: board.project_id,
                              };
                         });
                         resolve(result);
                    } else {
                         reject(error);
                    }
               });
          });
     }
}

const base = new BaseDb();
Object.freeze(base);
export default base;
