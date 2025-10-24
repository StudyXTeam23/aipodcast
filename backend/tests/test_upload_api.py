"""
测试文件上传 API
"""
import requests
import io

# API 基础 URL
BASE_URL = "http://localhost:18188"

def test_upload_api():
    """测试上传 API"""
    print("=" * 50)
    print("测试文件上传 API")
    print("=" * 50)
    
    # 创建测试文件
    test_content = """
# EchoCast 测试文档

这是一个测试文档，用于验证 EchoCast 播客平台的文件上传功能。

## 功能特性

1. 支持多种文件格式
2. AI 生成播客
3. 云存储集成

## 测试场景

- 文件上传
- 数据验证
- S3 存储
- 任务创建
"""
    
    # 准备文件
    files = {
        'file': ('test_document.txt', io.BytesIO(test_content.encode('utf-8')), 'text/plain')
    }
    
    print("\n1. 上传测试文件")
    print(f"   文件名: test_document.txt")
    print(f"   大小: {len(test_content)} bytes")
    
    try:
        # 发送上传请求
        response = requests.post(
            f"{BASE_URL}/api/v1/podcasts/upload",
            files=files,
            timeout=30
        )
        
        print(f"\n2. 响应状态: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ 上传成功！")
            print(f"\n响应数据:")
            print(f"   Podcast ID: {data.get('podcast_id')}")
            print(f"   Job ID: {data.get('job_id')}")
            print(f"   状态: {data.get('status')}")
            print(f"   消息: {data.get('message')}")
            
            return data.get('podcast_id'), data.get('job_id')
        else:
            print(f"❌ 上传失败")
            print(f"   错误: {response.text}")
            return None, None
    
    except requests.exceptions.ConnectionError:
        print("❌ 连接失败：服务器未启动")
        print("   请先启动服务器: cd backend && python3 -m uvicorn app.main:app")
        return None, None
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return None, None


def test_invalid_file_type():
    """测试无效文件类型"""
    print("\n" + "=" * 50)
    print("测试无效文件类型")
    print("=" * 50)
    
    # 尝试上传不支持的文件类型
    files = {
        'file': ('test.exe', io.BytesIO(b'fake exe content'), 'application/x-msdownload')
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/podcasts/upload",
            files=files,
            timeout=30
        )
        
        print(f"响应状态: {response.status_code}")
        
        if response.status_code == 400:
            print("✅ 正确拒绝了无效文件类型")
            print(f"   错误消息: {response.json().get('detail')}")
        else:
            print("❌ 应该拒绝无效文件类型")
    
    except Exception as e:
        print(f"❌ 请求异常: {e}")


def test_empty_file():
    """测试空文件"""
    print("\n" + "=" * 50)
    print("测试空文件")
    print("=" * 50)
    
    files = {
        'file': ('empty.txt', io.BytesIO(b''), 'text/plain')
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/podcasts/upload",
            files=files,
            timeout=30
        )
        
        print(f"响应状态: {response.status_code}")
        
        if response.status_code == 400:
            print("✅ 正确拒绝了空文件")
            print(f"   错误消息: {response.json().get('detail')}")
        else:
            print("❌ 应该拒绝空文件")
    
    except Exception as e:
        print(f"❌ 请求异常: {e}")


if __name__ == "__main__":
    print("\n🚀 开始测试上传 API\n")
    
    # 测试正常上传
    podcast_id, job_id = test_upload_api()
    
    if podcast_id:
        # 测试无效情况
        test_invalid_file_type()
        test_empty_file()
        
        print("\n" + "=" * 50)
        print("✅ 上传 API 测试完成")
        print("=" * 50)
    else:
        print("\n" + "=" * 50)
        print("⚠️  请先启动服务器再运行测试")
        print("=" * 50)

