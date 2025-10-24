"""
测试 S3 存储服务
"""
import io
from app.utils.s3_storage import s3_storage

def test_s3_operations():
    """测试 S3 操作"""
    print("=" * 50)
    print("测试 AWS S3 存储服务")
    print("=" * 50)
    print(f"Bucket: {s3_storage.bucket}")
    print(f"Region: {s3_storage.region}")
    
    # 1. 上传测试文件
    print("\n1. 测试文件上传")
    test_content = b"This is a test file for EchoCast podcast platform.\nTesting S3 upload functionality."
    file_obj = io.BytesIO(test_content)
    
    key = s3_storage.upload_file(
        file_obj=file_obj,
        original_filename="test.txt",
        prefix="test",
        content_type="text/plain"
    )
    
    if not key:
        print("❌ 上传失败")
        return False
    
    print(f"   文件键: {key}")
    
    # 2. 检查文件是否存在
    print("\n2. 测试文件存在性检查")
    exists = s3_storage.file_exists(key)
    print(f"   文件存在: {'是' if exists else '否'}")
    
    if not exists:
        print("❌ 文件不存在")
        return False
    
    # 3. 下载文件
    print("\n3. 测试文件下载")
    downloaded_content = s3_storage.download_file(key)
    
    if not downloaded_content:
        print("❌ 下载失败")
        return False
    
    print(f"   下载内容长度: {len(downloaded_content)} bytes")
    print(f"   内容匹配: {'是' if downloaded_content == test_content else '否'}")
    
    if downloaded_content != test_content:
        print("❌ 下载内容不匹配")
        return False
    
    # 4. 生成预签名 URL
    print("\n4. 测试预签名 URL 生成")
    presigned_url = s3_storage.generate_presigned_url(key, expires_in=300)  # 5 分钟
    
    if not presigned_url:
        print("❌ URL 生成失败")
        return False
    
    print(f"   URL: {presigned_url[:80]}...")
    
    # 5. 获取公开 URL
    print("\n5. 测试公开 URL")
    public_url = s3_storage.get_public_url(key)
    print(f"   URL: {public_url}")
    
    # 6. 删除文件
    print("\n6. 测试文件删除")
    success = s3_storage.delete_file(key)
    print(f"   删除结果: {'成功' if success else '失败'}")
    
    if not success:
        print("❌ 删除失败")
        return False
    
    # 7. 验证删除
    print("\n7. 验证文件已删除")
    exists = s3_storage.file_exists(key)
    print(f"   文件存在: {'是' if exists else '否'}")
    
    if exists:
        print("❌ 文件仍然存在")
        return False
    
    return True


if __name__ == "__main__":
    print("\n🚀 开始测试 S3Storage\n")
    
    try:
        success = test_s3_operations()
        
        print("\n" + "=" * 50)
        if success:
            print("✅ 所有 S3 测试通过！")
        else:
            print("❌ S3 测试失败")
        print("=" * 50)
    except Exception as e:
        print(f"\n❌ 测试异常: {e}")
        import traceback
        traceback.print_exc()

