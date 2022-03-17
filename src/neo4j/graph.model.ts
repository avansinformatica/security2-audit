// id's must be strings, otherwise free to choose
// NOTE: after the controller a translation should be made from 
// neo id to uuid

export namespace Graph {
  export abstract class Node {
    id: string;
  }
  
  
  export abstract class Relation {
    id: string;
    start: string;
    end: string;
  }
}
