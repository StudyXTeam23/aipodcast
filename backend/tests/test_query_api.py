"""
测试播客查询 API
"""
import requests
import json

BASE_URL = "http://localhost:18188"

def test_get_podcasts_list():
    """测试获取播客列表"""
    print("=" * 50)
    print("测试获取播客列表")
    print("=" * 50)
    
    try:
        # 1. 获取所有播客（默认第1页，20条）
        print("\n1. 获取所有播客（默认参数）")
        response = requests.get(f"{BASE_URL}/api/v1/podcasts")
        print(f"   状态码: {response.status_code}")
        
        if response.status_code == 200:
            podcasts = response.json()
            print(f"   ✅ 成功获取 {len(podcasts)} 个播客")
            for podcast in podcasts:
                print(f"      - {podcast['title']} (状态: {podcast['status']})")
            return podcasts
        else:
            print(f"   ❌ 失败: {response.text}")
            return []
    
    except Exception as e:
        print(f"   ❌ 异常: {e}")
        return []


def test_get_podcasts_with_pagination():
    """测试分页"""
    print("\n" + "=" * 50)
    print("测试分页功能")
    print("=" * 50)
    
    try:
        # 测试第1页，每页1条
        print("\n1. 获取第1页（每页1条）")
        response = requests.get(
            f"{BASE_URL}/api/v1/podcasts",
            params={"page": 1, "limit": 1}
        )
        
        if response.status_code == 200:
            podcasts = response.json()
            print(f"   ✅ 第1页: {len(podcasts)} 条记录")
        
        # 测试第2页
        print("\n2. 获取第2页（每页1条）")
        response = requests.get(
            f"{BASE_URL}/api/v1/podcasts",
            params={"page": 2, "limit": 1}
        )
        
        if response.status_code == 200:
            podcasts = response.json()
            print(f"   ✅ 第2页: {len(podcasts)} 条记录")
    
    except Exception as e:
        print(f"   ❌ 异常: {e}")


def test_search_podcasts():
    """测试搜索功能"""
    print("\n" + "=" * 50)
    print("测试搜索功能")
    print("=" * 50)
    
    try:
        # 搜索包含 "test" 的播客
        print("\n1. 搜索关键词: 'test'")
        response = requests.get(
            f"{BASE_URL}/api/v1/podcasts",
            params={"search": "test"}
        )
        
        if response.status_code == 200:
            podcasts = response.json()
            print(f"   ✅ 找到 {len(podcasts)} 个匹配结果")
            for podcast in podcasts:
                print(f"      - {podcast['title']}")
        
        # 搜索不存在的关键词
        print("\n2. 搜索关键词: 'nonexistent'")
        response = requests.get(
            f"{BASE_URL}/api/v1/podcasts",
            params={"search": "nonexistent"}
        )
        
        if response.status_code == 200:
            podcasts = response.json()
            print(f"   ✅ 找到 {len(podcasts)} 个匹配结果")
    
    except Exception as e:
        print(f"   ❌ 异常: {e}")


def test_get_podcast_detail(podcast_id):
    """测试获取播客详情"""
    print("\n" + "=" * 50)
    print("测试获取播客详情")
    print("=" * 50)
    
    if not podcast_id:
        print("   ⚠️  跳过：没有可用的 podcast_id")
        return None
    
    try:
        print(f"\n1. 获取播客: {podcast_id[:8]}...")
        response = requests.get(f"{BASE_URL}/api/v1/podcasts/{podcast_id}")
        
        if response.status_code == 200:
            podcast = response.json()
            print(f"   ✅ 成功获取播客详情")
            print(f"      标题: {podcast['title']}")
            print(f"      状态: {podcast['status']}")
            print(f"      文件: {podcast['original_filename']}")
            print(f"      大小: {podcast['file_size_bytes']} bytes")
            return podcast
        elif response.status_code == 404:
            print(f"   ✅ 正确返回404（播客不存在）")
        else:
            print(f"   ❌ 失败: {response.text}")
        
        return None
    
    except Exception as e:
        print(f"   ❌ 异常: {e}")
        return None


def test_get_nonexistent_podcast():
    """测试获取不存在的播客"""
    print("\n" + "=" * 50)
    print("测试获取不存在的播客")
    print("=" * 50)
    
    try:
        fake_id = "nonexistent-id-12345"
        print(f"\n1. 尝试获取不存在的播客: {fake_id}")
        response = requests.get(f"{BASE_URL}/api/v1/podcasts/{fake_id}")
        
        if response.status_code == 404:
            print(f"   ✅ 正确返回404")
            print(f"      错误信息: {response.json().get('detail')}")
        else:
            print(f"   ❌ 应该返回404")
    
    except Exception as e:
        print(f"   ❌ 异常: {e}")


def test_download_podcast(podcast_id):
    """测试下载播客（预期失败，因为音频尚未生成）"""
    print("\n" + "=" * 50)
    print("测试下载播客")
    print("=" * 50)
    
    if not podcast_id:
        print("   ⚠️  跳过：没有可用的 podcast_id")
        return
    
    try:
        print(f"\n1. 尝试下载播客: {podcast_id[:8]}...")
        response = requests.get(
            f"{BASE_URL}/api/v1/podcasts/{podcast_id}/download"
        )
        
        if response.status_code == 400:
            print(f"   ✅ 正确返回400（音频尚未生成）")
            print(f"      错误信息: {response.json().get('detail')}")
        elif response.status_code == 200:
            data = response.json()
            print(f"   ✅ 成功获取下载链接")
            print(f"      URL: {data.get('download_url')[:80]}...")
            print(f"      有效期: {data.get('expires_in')} 秒")
        else:
            print(f"   ❌ 意外状态码: {response.status_code}")
    
    except Exception as e:
        print(f"   ❌ 异常: {e}")


def test_delete_podcast(podcast_id):
    """测试删除播客"""
    print("\n" + "=" * 50)
    print("测试删除播客")
    print("=" * 50)
    
    if not podcast_id:
        print("   ⚠️  跳过：没有可用的 podcast_id")
        return
    
    try:
        print(f"\n1. 删除播客: {podcast_id[:8]}...")
        response = requests.delete(f"{BASE_URL}/api/v1/podcasts/{podcast_id}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ 删除成功")
            print(f"      消息: {data.get('message')}")
            
            # 验证删除
            print(f"\n2. 验证播客已被删除")
            verify_response = requests.get(
                f"{BASE_URL}/api/v1/podcasts/{podcast_id}"
            )
            if verify_response.status_code == 404:
                print(f"   ✅ 确认播客已不存在")
            else:
                print(f"   ❌ 播客仍然存在")
        else:
            print(f"   ❌ 删除失败: {response.text}")
    
    except Exception as e:
        print(f"   ❌ 异常: {e}")


if __name__ == "__main__":
    print("\n🚀 开始测试播客查询 API\n")
    
    try:
        # 1. 测试列表功能
        podcasts = test_get_podcasts_list()
        
        # 2. 测试分页
        test_get_podcasts_with_pagination()
        
        # 3. 测试搜索
        test_search_podcasts()
        
        # 获取第一个播客的 ID 用于后续测试
        podcast_id = None
        if podcasts:
            podcast_id = podcasts[0]['id']
        
        # 4. 测试获取详情
        test_get_podcast_detail(podcast_id)
        
        # 5. 测试获取不存在的播客
        test_get_nonexistent_podcast()
        
        # 6. 测试下载
        test_download_podcast(podcast_id)
        
        # 7. 测试删除（放在最后）
        test_delete_podcast(podcast_id)
        
        print("\n" + "=" * 50)
        print("✅ 所有查询 API 测试完成")
        print("=" * 50)
    
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()

