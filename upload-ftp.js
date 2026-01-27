import ftp from 'basic-ftp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadToFTP() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log('FTP 서버에 연결 중...');
    await client.access({
      host: '112.175.185.144',
      port: 21,
      user: 'tlghks132',
      password: 'Ghks3928*',
      secure: false
    });

    console.log('FTP 연결 성공!');
    console.log('원격 경로로 이동 중: /html');

    // 원격 디렉토리로 이동
    await client.cd('/html');

    // 기존 파일 정리 (선택사항)
    console.log('기존 파일 정리 중...');
    try {
      const files = await client.list();
      for (const file of files) {
        try {
          if (file.isDirectory) {
            await client.removeDir(file.name);
          } else {
            await client.remove(file.name);
          }
        } catch (e) {
          console.log(`파일 삭제 실패: ${file.name}`);
        }
      }
    } catch (e) {
      console.log('기존 파일 정리 건너뜀');
    }

    // dist 폴더의 내용을 업로드
    console.log('빌드 파일 업로드 중...');
    await client.uploadFromDir(path.join(__dirname, 'dist'));

    console.log('✅ 업로드 완료!');
    console.log('접속 URL: http://tlghks132.dothome.co.kr');
  } catch (err) {
    console.error('❌ 업로드 실패:', err);
  }

  client.close();
}

uploadToFTP();
