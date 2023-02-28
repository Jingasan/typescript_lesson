import * as S3 from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as fs from "fs";

// 接続先設定（S3のMockであるs3rverを利用）
const s3config: S3.S3ClientConfig = {
  forcePathStyle: true,
  credentials: {
    accessKeyId: "S3RVER",
    secretAccessKey: "S3RVER",
  },
  endpoint: "http://localhost:4568",
};
const s3client = new S3.S3Client(s3config);

// S3バケットの作成
const runCreateBucket = async (bucketName: string): Promise<boolean> => {
  try {
    const createBucketParam: S3.CreateBucketCommandInput = {
      Bucket: bucketName,
    };
    const res = await s3client.send(
      new S3.CreateBucketCommand(createBucketParam)
    );
    console.log("Success", res);
    return true;
  } catch (err) {
    console.log("Error", err);
    return false;
  }
};

// S3バケット一覧の取得
const runListBuckets = async (): Promise<string[]> => {
  const bucketlist: string[] = [];
  try {
    const data = await s3client.send(new S3.ListBucketsCommand({}));
    data.Buckets?.forEach((bucket: S3.Bucket) => {
      if (bucket.Name) bucketlist.push(bucket.Name);
    });
  } catch (err) {
    console.log("Error", err);
  }
  console.log("Success", bucketlist);
  return bucketlist;
};

// S3バケットへのオブジェクト作成
const runPutObject = async (
  bucketName: string,
  key: string,
  json: any
): Promise<boolean> => {
  try {
    const putObjectParam: S3.PutObjectCommandInput = {
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(json),
    };
    const res = await s3client.send(new S3.PutObjectCommand(putObjectParam));
    console.log("Success", res);
    return true;
  } catch (err) {
    console.log("Error", err);
    return false;
  }
};

// S3バケットからのオブジェクト取得
const runGetObject = async (
  bucketName: string,
  key: string
): Promise<string | undefined> => {
  try {
    const getObjectParam: S3.GetObjectCommandInput = {
      Bucket: bucketName,
      Key: key,
    };
    const res = await s3client.send(new S3.GetObjectCommand(getObjectParam));
    console.log("Success");
    return await res.Body?.transformToString();
  } catch (err) {
    console.log("Error", err);
    return undefined;
  }
};

// S3バケットへのファイルアップロード
const runUploadFile = async (bucketName: string): Promise<boolean> => {
  try {
    const putObjectParam: S3.PutObjectCommandInput = {
      Bucket: bucketName,
      Key: "image.png",
      Body: fs.createReadStream("image.png"),
    };
    const res = await s3client.send(new S3.PutObjectCommand(putObjectParam));
    console.log("Success", res);
    return true;
  } catch (err) {
    console.log("Error", err);
    return false;
  }
};

// S3バケットのオブジェクト一覧取得(1000件以上)
const runListObjects = async (bucketName: string): Promise<string[]> => {
  const listObjectsParam: S3.ListObjectsCommandInput = {
    Bucket: bucketName,
  };
  let truncated: boolean | undefined = true;
  let pageMarker;
  let filelist: string[] = [];
  while (truncated) {
    try {
      const res = await s3client.send(
        new S3.ListObjectsCommand(listObjectsParam)
      );
      res.Contents?.forEach((item) => {
        if (item.Key) filelist.push(item.Key);
      });
      truncated = res.IsTruncated;
      if (truncated) {
        pageMarker = res.Contents?.slice(-1)[0].Key;
        listObjectsParam.Marker = pageMarker;
      }
    } catch (err) {
      console.log("Error", err);
      truncated = false;
    }
  }
  console.log(filelist);
  return filelist;
};

// S3バケットのオブジェクト削除
const runDeleteObject = async (
  bucketName: string,
  key: string
): Promise<boolean> => {
  try {
    const deleteObjectParam: S3.DeleteObjectCommandInput = {
      Bucket: bucketName,
      Key: key,
    };
    console.log(deleteObjectParam);
    const res = await s3client.send(
      new S3.DeleteObjectCommand(deleteObjectParam)
    );
    console.log("Success", res);
    return true;
  } catch (err) {
    console.log("Error", err);
    return false;
  }
};

// Presigned URLの取得
const runGetPresignedURL = async (
  bucketName: string,
  key: string,
  json: any
): Promise<boolean> => {
  try {
    const putObjectParam: S3.PutObjectCommandInput = {
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(json),
    };
    const url = await getSignedUrl(
      s3client,
      new S3.PutObjectCommand(putObjectParam),
      {
        expiresIn: 3600,
      }
    );
    console.log("Success", url);
    return true;
  } catch (err) {
    console.log("Error", err);
    return false;
  }
};

// S3バケットの削除
const runDeleteBucket = async (bucketName: string): Promise<boolean> => {
  try {
    const deleteBucketParam: S3.DeleteBucketCommandInput = {
      Bucket: bucketName,
    };
    const res = await s3client.send(
      new S3.DeleteBucketCommand(deleteBucketParam)
    );
    console.log("Success", res);
    return true;
  } catch (err) {
    console.log("Error", err);
    return false;
  }
};

const runAll = async () => {
  const bucketName = "test_bucket";

  // S3バケットの作成
  console.log(">>> Create bucket");
  await runCreateBucket(bucketName);

  // S3バケット一覧の取得
  console.log(">>> List buckets");
  await runListBuckets();
  const filepath = "json/sample.json";
  const json = {
    data: "sample",
  };

  // S3バケットへのオブジェクト作成
  console.log(">>> Put object");
  await runPutObject(bucketName, filepath, json);

  // S3バケットへのファイルアップロード
  console.log(">>> Upload file");
  await runUploadFile(bucketName);

  // S3バケットからのオブジェクト取得
  console.log(">>> Get object");
  const res = await runGetObject(bucketName, filepath);
  console.log(res !== undefined ? JSON.parse(res) : "");

  // S3バケットのオブジェクト一覧取得(1000件以上)
  console.log(">>> List objects");
  const filelist = await runListObjects(bucketName);

  // S3バケットのオブジェクト削除
  console.log(">>> Delete object");
  filelist.forEach(
    async (file: string) => await runDeleteObject(bucketName, file)
  );

  // PresignedURLの取得
  console.log(">>> Get presigned URL");
  await runGetPresignedURL(bucketName, filepath, json);

  // S3バケットの削除
  console.log(">>> Delete bucket");
  await runDeleteBucket(bucketName);
};
runAll();
