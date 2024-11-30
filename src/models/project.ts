
namespace App{


export enum ProjectStatus{
    ACTIVE = "active",FINISHED = 'finished',
}


export class Project{
    public readonly id: string;
    constructor(public title:string,public description:string,public people:number,public  status:ProjectStatus) {
        this.id= Date.now().toString();
        this.title=title;
        this.description=description;
        this.people=people;
    }
}
}