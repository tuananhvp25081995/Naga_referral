export class UploadModel{
    constructor(db){
        this.db=db;
        this.col_image=this.db.collection("image")
    }

    async UploadImage(){
        
    }
}