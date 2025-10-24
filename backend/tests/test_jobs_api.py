"""
测试任务状态 API
"""
import requests
import io

BASE_URL = "http://localhost:18188"

def test_job_status_api():
    """测试任务状态 API"""
    print("=" * 50)
    print("测试任务状态 API")
    print("=" * 50)
    
    try:
        # 1. 先上传一个文件创建任务
        print("\n1. 上传文件创建任务")
        test_content = b"Test content for job status API testing."
        files = {
            'file': ('test_job.txt', io.BytesIO(test_content), 'text/plain')
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/podcasts/upload",
            files=files
        )
        
        if response.status_code != 200:
            print(f"   ❌ 上传失败: {response.text}")
            return
        
        data = response.json()
        job_id = data.get('job_id')
        podcast_id = data.get('podcast_id')
        
        print(f"   ✅ 任务创建成功")
        print(f"      Job ID: {job_id}")
        print(f"      Podcast ID: {podcast_id}")
        
        # 2. 查询任务状态
        print(f"\n2. 查询任务状态")
        response = requests.get(f"{BASE_URL}/api/v1/jobs/{job_id}")
        
        if response.status_code == 200:
            job = response.json()
            print(f"   ✅ 成功获取任务状态")
            print(f"      任务ID: {job['id']}")
            print(f"      播客ID: {job['podcast_id']}")
            print(f"      状态: {job['status']}")
            print(f"      进度: {job['progress']}%")
            
            # 验证数据完整性
            assert job['id'] == job_id, "Job ID 不匹配"
            assert job['podcast_id'] == podcast_id, "Podcast ID 不匹配"
            assert 'status' in job, "缺少 status 字段"
            assert 'progress' in job, "缺少 progress 字段"
            assert 'created_at' in job, "缺少 created_at 字段"
            assert 'updated_at' in job, "缺少 updated_at 字段"
            
            print(f"   ✅ 数据完整性验证通过")
        else:
            print(f"   ❌ 查询失败: {response.text}")
            return
        
        # 3. 测试不存在的任务
        print(f"\n3. 查询不存在的任务")
        fake_job_id = "nonexistent-job-12345"
        response = requests.get(f"{BASE_URL}/api/v1/jobs/{fake_job_id}")
        
        if response.status_code == 404:
            print(f"   ✅ 正确返回404")
            print(f"      错误信息: {response.json().get('detail')}")
        else:
            print(f"   ❌ 应该返回404")
        
        # 4. 清理：删除创建的播客
        print(f"\n4. 清理测试数据")
        response = requests.delete(
            f"{BASE_URL}/api/v1/podcasts/{podcast_id}"
        )
        
        if response.status_code == 200:
            print(f"   ✅ 测试数据清理成功")
        
        return True
    
    except AssertionError as e:
        print(f"   ❌ 断言失败: {e}")
        return False
    except Exception as e:
        print(f"   ❌ 异常: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_job_lifecycle():
    """测试任务生命周期"""
    print("\n" + "=" * 50)
    print("测试任务生命周期")
    print("=" * 50)
    
    try:
        # 创建任务
        print("\n1. 创建任务")
        files = {
            'file': ('lifecycle_test.txt', io.BytesIO(b'Lifecycle test'), 'text/plain')
        }
        response = requests.post(
            f"{BASE_URL}/api/v1/podcasts/upload",
            files=files
        )
        
        if response.status_code != 200:
            print(f"   ❌ 创建失败")
            return False
        
        job_id = response.json().get('job_id')
        podcast_id = response.json().get('podcast_id')
        print(f"   ✅ 任务创建: {job_id[:8]}...")
        
        # 查询初始状态
        print("\n2. 查询初始状态")
        response = requests.get(f"{BASE_URL}/api/v1/jobs/{job_id}")
        job = response.json()
        
        print(f"   状态: {job['status']}")
        print(f"   进度: {job['progress']}%")
        
        assert job['status'] in ['pending', 'processing'], "初始状态应该是 pending 或 processing"
        assert job['progress'] >= 0, "进度应该 >= 0"
        
        print(f"   ✅ 初始状态正确")
        
        # 清理
        print("\n3. 清理")
        requests.delete(f"{BASE_URL}/api/v1/podcasts/{podcast_id}")
        print(f"   ✅ 清理完成")
        
        return True
    
    except Exception as e:
        print(f"   ❌ 异常: {e}")
        return False


if __name__ == "__main__":
    print("\n🚀 开始测试任务状态 API\n")
    
    try:
        # 测试基本功能
        result1 = test_job_status_api()
        
        # 测试生命周期
        result2 = test_job_lifecycle()
        
        print("\n" + "=" * 50)
        if result1 and result2:
            print("✅ 所有任务状态 API 测试通过")
        else:
            print("❌ 部分测试失败")
        print("=" * 50)
    
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()

