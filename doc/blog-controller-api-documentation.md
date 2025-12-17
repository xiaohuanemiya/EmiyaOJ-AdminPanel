# 博客管理 API 文档

本文档包含博客管理的所有接口说明，供前端开发使用。

---

## 目录

1. [博客管理 API](#博客管理-api)
2. [通用响应格式](#通用响应格式)
3. [通用数据模型](#通用数据模型)

---

## 博客管理 API

### 1. 分页查询博客

**接口描述**: 分页查询博客列表，支持按状态、分类和关键词筛选

**请求方式**: `GET`

**请求路径**: `/blog/page`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNo | Integer | 是 | 页码（从1开始） |
| pageSize | Integer | 是 | 每页数量 |
| status | Integer | 否 | 状态筛选（0-草稿，1-已发布） |
| category | String | 否 | 分类筛选 |
| keyword | String | 否 | 关键词搜索（匹配标题或内容） |
| sortBy | String | 否 | 排序字段 |
| isAsc | Boolean | 否 | 是否升序（true-升序，false-降序） |

**请求示例**: `/blog/page?pageNo=1&pageSize=10&status=1&keyword=算法`

**响应示例**:
```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "total": 50,
    "pages": 5,
    "list": [
      {
        "id": 1,
        "title": "算法学习笔记",
        "summary": "深入理解常见算法及其应用",
        "content": "详细内容...",
        "author": "张三",
        "category": "算法",
        "tags": ["算法", "数据结构"],
        "coverImage": "https://example.com/cover.jpg",
        "viewCount": 1500,
        "likeCount": 200,
        "status": 1,
        "isTop": 0,
        "createTime": "2024-01-01T10:00:00",
        "updateTime": "2024-01-10T15:30:00"
      }
    ]
  }
}
```

**字段说明**:

| 字段名 | 类型 | 说明 |
|--------|------|------|
| total | Long | 总记录数 |
| pages | Long | 总页数 |
| list | List | 博客列表 |

**博客对象字段**:

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 博客ID |
| title | String | 博客标题 |
| summary | String | 摘要 |
| content | String | 内容 |
| author | String | 作者 |
| category | String | 分类 |
| tags | String[] | 标签列表 |
| coverImage | String | 封面图片URL |
| viewCount | Integer | 浏览次数 |
| likeCount | Integer | 点赞次数 |
| status | Integer | 状态（0-草稿，1-已发布） |
| isTop | Integer | 是否置顶（0-否，1-是） |
| createTime | LocalDateTime | 创建时间 |
| updateTime | LocalDateTime | 更新时间 |

---

### 2. 获取博客详情

**接口描述**: 根据博客ID获取博客详细信息

**请求方式**: `GET`

**请求路径**: `/blog/{id}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 博客ID |

**请求示例**: `/blog/1`

**成功响应示例**:
```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "id": 1,
    "title": "算法学习笔记",
    "summary": "深入理解常见算法及其应用",
    "content": "详细内容...",
    "author": "张三",
    "category": "算法",
    "tags": ["算法", "数据结构"],
    "coverImage": "https://example.com/cover.jpg",
    "viewCount": 1500,
    "likeCount": 200,
    "status": 1,
    "isTop": 0,
    "createTime": "2024-01-01T10:00:00",
    "updateTime": "2024-01-10T15:30:00"
  }
}
```

**失败响应示例**:
```json
{
  "code": 500,
  "msg": "博客不存在",
  "data": null
}
```

---

### 3. 新增博客

**接口描述**: 创建新博客

**请求方式**: `POST`

**请求路径**: `/blog`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "title": "算法学习笔记",
  "summary": "深入理解常见算法及其应用",
  "content": "详细内容...",
  "author": "张三",
  "category": "算法",
  "tags": ["算法", "数据结构"],
  "coverImage": "https://example.com/cover.jpg",
  "status": 1,
  "isTop": 0
}
```

**请求字段说明**:

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | String | 是 | 博客标题（最多255个字符） |
| summary | String | 否 | 摘要（最多500个字符） |
| content | String | 是 | 内容 |
| author | String | 否 | 作者（最多50个字符） |
| category | String | 否 | 分类（最多50个字符） |
| tags | String[] | 否 | 标签列表 |
| coverImage | String | 否 | 封面图片URL |
| status | Integer | 否 | 状态（0-草稿，1-已发布） |
| isTop | Integer | 否 | 是否置顶（0-否，1-是） |

**成功响应示例**:
```json
{
  "code": 200,
  "msg": "Success",
  "data": null
}
```

**失败响应示例**:
```json
{
  "code": 500,
  "msg": "新增博客失败",
  "data": null
}
```

**参数校验失败示例**:
```json
{
  "code": 400,
  "msg": "博客标题不能为空",
  "data": null
}
```

---

### 4. 修改博客

**接口描述**: 更新博客信息

**请求方式**: `PUT`

**请求路径**: `/blog`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "id": 1,
  "title": "算法学习笔记（修改）",
  "summary": "修改后的摘要",
  "content": "修改后的内容...",
  "author": "张三",
  "category": "算法",
  "tags": ["算法", "数据结构", "编程"],
  "coverImage": "https://example.com/cover-new.jpg",
  "status": 1,
  "isTop": 0
}
```

**请求字段说明**: 与新增博客相同，但 `id` 字段必填

**成功响应示例**:
```json
{
  "code": 200,
  "msg": "Success",
  "data": null
}
```

**失败响应示例**:
```json
{
  "code": 500,
  "msg": "博客ID不能为空",
  "data": null
}
```

或

```json
{
  "code": 500,
  "msg": "修改博客失败",
  "data": null
}
```

---

### 5. 删除博客

**接口描述**: 根据博客ID删除博客

**请求方式**: `DELETE`

**请求路径**: `/blog/{id}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 博客ID |

**请求示例**: `/blog/1`

**成功响应示例**:
```json
{
  "code": 200,
  "msg": "Success",
  "data": null
}
```

**失败响应示例**:
```json
{
  "code": 500,
  "msg": "删除博客失败",
  "data": null
}
```

---

### 6. 批量删除博客

**接口描述**: 批量删除多个博客

**请求方式**: `DELETE`

**请求路径**: `/blog/batch`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
[1, 2, 3, 4, 5]
```

**请求字段说明**: 博客ID数组

**成功响应示例**:
```json
{
  "code": 200,
  "msg": "Success",
  "data": null
}
```

**失败响应示例**:
```json
{
  "code": 500,
  "msg": "批量删除博客失败",
  "data": null
}
```

---

### 7. 修改博客状态

**接口描述**: 修改博客的发布状态

**请求方式**: `PUT`

**请求路径**: `/blog/{id}/status`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 博客ID |

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | Integer | 是 | 状态（0-草稿，1-已发布） |

**请求示例**: `/blog/1/status?status=1`

**成功响应示例**:
```json
{
  "code": 200,
  "msg": "Success",
  "data": null
}
```

**失败响应示例**:
```json
{
  "code": 500,
  "msg": "修改博客状态失败",
  "data": null
}
```

---

### 8. 修改博客置顶状态

**接口描述**: 修改博客的置顶状态

**请求方式**: `PUT`

**请求路径**: `/blog/{id}/top`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 博客ID |

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| isTop | Integer | 是 | 是否置顶（0-否，1-是） |

**请求示例**: `/blog/1/top?isTop=1`

**成功响应示例**:
```json
{
  "code": 200,
  "msg": "Success",
  "data": null
}
```

**失败响应示例**:
```json
{
  "code": 500,
  "msg": "修改博客置顶状态失败",
  "data": null
}
```

---

## 通用响应格式

所有接口统一使用 `ResponseResult` 包装响应数据：

```json
{
  "code": 200,
  "msg": "Success",
  "data": {}
}
```

**字段说明**:

| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | Integer | 响应状态码（200-成功，500-失败，400-参数错误） |
| msg | String | 响应消息 |
| data | Object | 响应数据（可以为null、对象、数组等） |

---

## 通用数据模型

### 分页请求参数 (PageDTO)

用于分页查询的请求参数：

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNo | Integer | 是 | 页码（从1开始） |
| pageSize | Integer | 是 | 每页数量 |
| sortBy | String | 否 | 排序字段 |
| isAsc | Boolean | 否 | 是否升序（true-升序，false-降序） |

### 分页响应数据 (PageVO)

分页查询的响应数据格式：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| total | Long | 总记录数 |
| pages | Long | 总页数 |
| list | List | 数据列表 |

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误（参数校验失败） |
| 401 | 未授权（需要登录） |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 注意事项

1. **时间格式**: 所有时间字段使用 ISO 8601 格式，如 `2024-01-01T10:00:00`
2. **字符编码**: 所有接口使用 UTF-8 编码
3. **Content-Type**: POST、PUT 请求需要设置 `Content-Type: application/json`
4. **ID字段**: 新增操作不需要传 ID，修改操作必须传 ID
5. **必填字段**: 请求参数中标记为"必填"的字段不能为空或null
6. **字符长度限制**: 
   - 博客标题: 最多255个字符
   - 摘要: 最多500个字符
   - 作者: 最多50个字符
   - 分类: 最多50个字符
7. **状态枚举值**: 0-草稿，1-已发布
8. **置顶标识**: 0-否，1-是

---

## 更新日志

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2024-12-17 | 初始版本，包含博客管理所有接口 |

---

## 联系方式

如有疑问，请联系后端开发团队。
