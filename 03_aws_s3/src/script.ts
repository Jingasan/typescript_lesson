import * as AWS from "aws-sdk";
const S3: AWS.S3 = new AWS.S3();

async function GetBucketList() {
  try {
    const data = await S3.listBuckets().promise();
    console.log(data);
  } catch (err) {
    console.log(err);
  }
}

GetBucketList();
