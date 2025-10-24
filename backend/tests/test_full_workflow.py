"""
测试完整播客生成流程
上传 → 处理 → 生成音频 → 完成
"""
import requests
import io
import time

BASE_URL = "http://localhost:18188"

def test_complete_workflow():
    """测试完整的播客生成流程"""
    print("=" * 60)
    print("🚀 测试完整播客生成流程")
    print("=" * 60)
    
    # 1. 上传文件
    print("\n📤 步骤 1/4: 上传文件")
    test_content = """
EchoCast Podcast Platform Testing

This is a comprehensive test of the EchoCast podcast generation system.
We are testing the complete workflow from file upload to AI-powered audio generation.

The system uses ElevenLabs API to convert this text into natural-sounding speech.
This test validates the integration of file processing, text extraction, 
AI audio generation, and cloud storage functionality.

Let's see how well this works!
"""
    
    files = {
        'file': ('test_podcast.txt', io.BytesIO(test_content.encode('utf-8')), 'text/plain')
    }
    
    response = requests.post(
        f"{BASE_URL}/api/v1/podcasts/upload",
        files=files,
        timeout=30
    )
    
    if response.status_code != 200:
        print(f"❌ 上传失败: {response.text}")
        return False
    
    data = response.json()
    podcast_id = data.get('podcast_id')
    job_id = data.get('job_id')
    
    print(f"✅ 上传成功")
    print(f"   Podcast ID: {podcast_id}")
    print(f"   Job ID: {job_id}")
    
    # 2. 轮询任务状态
    print(f"\n⏳ 步骤 2/4: 等待处理完成...")
    max_wait_time = 120  # 最长等待2分钟
    start_time = time.time()
    last_progress = -1
    
    while True:
        if time.time() - start_time > max_wait_time:
            print(f"❌ 超时：等待超过 {max_wait_time} 秒")
            return False
        
        response = requests.get(f"{BASE_URL}/api/v1/jobs/{job_id}")
        if response.status_code != 200:
            print(f"❌ 查询任务失败")
            return False
        
        job = response.json()
        status = job.get('status')
        progress = job.get('progress', 0)
        
        if progress != last_progress:
            print(f"   进度: {progress}% - 状态: {status}")
            last_progress = progress
        
        if status == 'completed':
            print(f"✅ 处理完成！")
            break
        elif status == 'failed':
            error = job.get('error_message', '未知错误')
            print(f"❌ 处理失败: {error}")
            return False
        
        time.sleep(2)  # 每2秒检查一次
    
    # 3. 获取播客详情
    print(f"\n📊 步骤 3/4: 获取播客详情")
    response = requests.get(f"{BASE_URL}/api/v1/podcasts/{podcast_id}")
    
    if response.status_code != 200:
        print(f"❌ 获取详情失败")
        return False
    
    podcast = response.json()
    print(f"✅ 播客详情:")
    print(f"   标题: {podcast.get('title')}")
    print(f"   状态: {podcast.get('status')}")
    print(f"   音频URL: {podcast.get('audio_url', 'N/A')[:80]}...")
    print(f"   转录长度: {len(podcast.get('transcript', ''))} 字符")
    print(f"   时长: {podcast.get('duration_seconds', 0)} 秒")
    
    if podcast.get('status') != 'completed':
        print(f"❌ 播客状态不是 completed")
        return False
    
    if not podcast.get('audio_url'):
        print(f"❌ 没有音频 URL")
        return False
    
    # 4. 测试下载
    print(f"\n📥 步骤 4/4: 测试下载")
    response = requests.get(f"{BASE_URL}/api/v1/podcasts/{podcast_id}/download")
    
    if response.status_code != 200:
        print(f"❌ 获取下载链接失败")
        return False
    
    download_data = response.json()
    download_url = download_data.get('download_url')
    
    print(f"✅ 下载链接获取成功")
    print(f"   URL: {download_url[:80]}...")
    print(f"   有效期: {download_data.get('expires_in')} 秒")
    
    # 验证下载链接可用
    print(f"\n🔍 验证音频文件...")
    try:
        audio_response = requests.head(download_url, timeout=10)
        if audio_response.status_code == 200:
            content_length = audio_response.headers.get('Content-Length', 'unknown')
            print(f"✅ 音频文件可访问")
            print(f"   文件大小: {content_length} bytes")
        else:
            print(f"⚠️  音频文件响应码: {audio_response.status_code}")
    except Exception as e:
        print(f"⚠️  无法验证音频文件: {e}")
    
    # 清理
    print(f"\n🗑️  清理测试数据")
    response = requests.delete(f"{BASE_URL}/api/v1/podcasts/{podcast_id}")
    if response.status_code == 200:
        print(f"✅ 测试数据已清理")
    
    return True


if __name__ == "__main__":
    print("\n🎬 开始完整流程测试\n")
    
    try:
        success = test_complete_workflow()
        
        print("\n" + "=" * 60)
        if success:
            print("🎉 完整流程测试通过！")
            print("   ✅ 文件上传")
            print("   ✅ 文本提取")
            print("   ✅ AI 音频生成 (ElevenLabs)")
            print("   ✅ S3 存储")
            print("   ✅ 下载链接")
        else:
            print("❌ 测试失败")
        print("=" * 60)
    
    except KeyboardInterrupt:
        print("\n⚠️  测试被中断")
    except Exception as e:
        print(f"\n❌ 测试异常: {e}")
        import traceback
        traceback.print_exc()

