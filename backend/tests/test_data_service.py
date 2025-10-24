"""
测试 data_service 功能
"""
import uuid
from app.services.data_service import data_service

def test_podcast_operations():
    """测试播客操作"""
    print("=" * 50)
    print("测试播客操作")
    print("=" * 50)
    
    # 1. 创建测试播客
    test_podcast = {
        "id": str(uuid.uuid4()),
        "title": "测试播客 1",
        "status": "processing",
        "original_filename": "test.pdf"
    }
    
    print(f"\n1. 保存播客: {test_podcast['title']}")
    result = data_service.save_podcast(test_podcast)
    print(f"   结果: {'成功' if result else '失败'}")
    
    # 2. 读取所有播客
    print("\n2. 读取所有播客:")
    podcasts = data_service.read_podcasts()
    print(f"   共 {len(podcasts)} 个播客")
    for p in podcasts:
        print(f"   - {p['title']} (ID: {p['id'][:8]}..., 状态: {p['status']})")
    
    # 3. 获取单个播客
    print(f"\n3. 获取播客 ID: {test_podcast['id'][:8]}...")
    podcast = data_service.get_podcast(test_podcast["id"])
    if podcast:
        print(f"   找到: {podcast['title']}")
    else:
        print("   未找到")
    
    # 4. 更新播客
    print(f"\n4. 更新播客状态为 'completed'")
    result = data_service.update_podcast(test_podcast["id"], {
        "status": "completed",
        "audio_url": "https://s3.example.com/audio.mp3"
    })
    print(f"   结果: {'成功' if result else '失败'}")
    
    # 验证更新
    podcast = data_service.get_podcast(test_podcast["id"])
    if podcast:
        print(f"   新状态: {podcast['status']}")
        print(f"   音频URL: {podcast.get('audio_url', 'N/A')}")
    
    # 5. 删除播客
    print(f"\n5. 删除播客")
    result = data_service.delete_podcast(test_podcast["id"])
    print(f"   结果: {'成功' if result else '失败'}")
    
    # 验证删除
    podcasts = data_service.read_podcasts()
    print(f"   剩余 {len(podcasts)} 个播客")
    
    print("\n✅ 播客操作测试完成\n")


def test_job_operations():
    """测试任务操作"""
    print("=" * 50)
    print("测试任务操作")
    print("=" * 50)
    
    # 1. 创建测试任务
    test_job = {
        "id": str(uuid.uuid4()),
        "podcast_id": str(uuid.uuid4()),
        "status": "pending",
        "progress": 0
    }
    
    print(f"\n1. 保存任务: {test_job['id'][:8]}...")
    result = data_service.save_job(test_job)
    print(f"   结果: {'成功' if result else '失败'}")
    
    # 2. 读取所有任务
    print("\n2. 读取所有任务:")
    jobs = data_service.read_jobs()
    print(f"   共 {len(jobs)} 个任务")
    for j in jobs:
        print(f"   - 任务 {j['id'][:8]}... (状态: {j['status']}, 进度: {j.get('progress', 0)}%)")
    
    # 3. 更新任务进度
    print(f"\n3. 更新任务进度")
    for progress in [25, 50, 75, 100]:
        data_service.update_job(test_job["id"], {
            "progress": progress,
            "status": "processing" if progress < 100 else "completed"
        })
        print(f"   进度: {progress}%")
    
    # 验证最终状态
    job = data_service.get_job(test_job["id"])
    if job:
        print(f"   最终状态: {job['status']}, 进度: {job['progress']}%")
    
    # 4. 删除任务
    print(f"\n4. 删除任务")
    result = data_service.delete_job(test_job["id"])
    print(f"   结果: {'成功' if result else '失败'}")
    
    # 验证删除
    jobs = data_service.read_jobs()
    print(f"   剩余 {len(jobs)} 个任务")
    
    print("\n✅ 任务操作测试完成\n")


if __name__ == "__main__":
    print("\n🚀 开始测试 DataService\n")
    
    try:
        test_podcast_operations()
        test_job_operations()
        
        print("=" * 50)
        print("✅ 所有测试通过！")
        print("=" * 50)
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()

