class Reactor {
  constructor(x, y, z){
    this.contents = [];
    let temp1 = [];
    let temp2 = [];
    for(let i = 0; i < z; i ++){
      temp1.push(0);
    }
    for(let i = 0; i < x; i ++){
      temp2.push(temp1);
    }
    for(let i = 0; i < y; i ++){
      contents.push(temp2);
    }
  }

  export(){
    console.error("NYI!");
  }
}
