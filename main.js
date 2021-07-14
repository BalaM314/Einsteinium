class Reactor {
  constructor(x, y, z){
    this.contents = [];
    this.named = "Unnamed Reactor";
    let temp1 = [];
    let temp2 = [];
    for(let i = 0; i < z; i ++){
      temp1.push(0);
    }
    for(let i = 0; i < x; i ++){
      temp2.push(temp1);
    }
    for(let i = 0; i < y; i ++){
      this.contents.push(temp2);
    }
  }

  edit(x, y, z, id){
    if(isNan(id)){
      console.error(`Invalid attempt to edit reactor 1 at position ${x},${y},${z} with bad id ${id}`);
      return false;
    }
    try {
      this.contents[z][x][y] = id;
      return true;
    } catch(err){
      console.error(`Invalid attempt to edit reactor 1 at position ${x},${y},${z} with bad id ${id}`);
      return false;
    }
  }

  validate(){
    return true;// TODO: make this actually validate
  }

  export(){
    console.error("NYI!");
  }
}
