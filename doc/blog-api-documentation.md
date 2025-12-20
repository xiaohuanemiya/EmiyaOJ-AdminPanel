# 博客模块接口文档

> 基础路径: `/blog`  
> 模块标签: 博客管理  
> 需要认证: 是（所有接口需要 JWT Token）

---

## 目录

1. [博客相关接口](#一博客相关接口)
   - [查询所有博客](#1-查询所有博客)
   - [发布博客](#2-发布博客)
   - [分页条件查询博客](#3-分页条件查询博客)
   - [获取指定博客信息](#4-获取指定博客信息)
   - [删除博客](#5-删除博客)
   - [修改博客](#6-修改博客)
2. [评论相关接口](#二评论相关接口)
   - [分页查询博客评论](#7-分页查询博客评论)
   - [发表评论](#8-发表评论)
   - [条件查询评论](#9-条件查询评论)
   - [获取指定评论](#10-获取指定评论)
   - [删除评论](#11-删除评论)
3. [收藏相关接口](#三收藏相关接口)
   - [收藏博客](#12-收藏博客)
   - [取消收藏博客](#13-取消收藏博客)
4. [用户博客相关接口](#四用户博客相关接口)
   - [查询用户博客信息](#14-查询用户博客信息)
   - [分页查询用户发表的博客](#15-分页查询用户发表的博客)
   - [分页查询用户收藏的博客](#16-分页查询用户收藏的博客)
5. [标签相关接口](#五标签相关接口)
   - [查询所有标签](#17-查询所有标签)
6. [通用数据结构](#六通用数据结构)

---

## 一、博客相关接口

### 1. 查询所有博客

**接口名称**: `blogs`

| 项目     | 描述                   |
| -------- | ---------------------- |
| 请求路径 | `GET /blog`            |
| 请求方式 | GET                    |
| 权限标识 | `BLOG.LIST`            |
| 功能描述 | 查询系统中所有博客列表 |

**请求参数**: 无

**响应结果**:

```json
{
  "code": 200,
  "msg": "Success",
  "data": [
    {
      "id": "博客ID (String)",
      "userId": "用户ID (String)",
      "title": "博客标题",
      "content": "博客内容",
      "createTime": "2025-12-21T10:30:00",
      "updateTime": "2025-12-21T11:00:00"
    }
  ]
}
```

---

### 2. 发布博客

**接口名称**: `addBlog`

| 项目     | 描述                                           |
| -------- | ---------------------------------------------- |
| 请求路径 | `POST /blog`                                   |
| 请求方式 | POST                                           |
| 权限标识 | `BLOG.ADD`                                     |
| 功能描述 | 发布新博客，用户ID可由后端自动从Token中解析获取 |

**请求参数 (Body - JSON)**:

| 参数名   | 类型         | 必填 | 说明                              | 约束                 |
| -------- | ------------ | ---- | --------------------------------- | -------------------- |
| userId   | Long         | 否   | 用户ID (可由后端自动填充)         | -                    |
| title    | String       | 是   | 博客标题                          | 最大长度 50          |
| content  | String       | 是   | 博客内容                          | 最大长度 1000        |
| tagIds   | List\<Long\> | 是   | 标签ID列表                        | 至少选择一个标签     |

**请求示例**:

```json
{
  "title": "我的第一篇博客",
  "content": "这是博客内容...",
  "tagIds": [1, 2, 3]
}
```

**响应结果**:

成功:
```json
{
  "code": 200,
  "msg": "Success",
  "data": null
}
```

失败:
```json
{
  "code": 500,
  "msg": "添加失败",
  "data": null
}
```

---

### 3. 分页条件查询博客

**接口名称**: `queryBlog`

| 项目     | 描述                                       |
| -------- | ------------------------------------------ |
| 请求路径 | `POST /blog/query`                         |
| 请求方式 | POST                                       |
| 权限标识 | `BLOG.LIST`                                |
| 功能描述 | 分页条件查询博客，支持标题模糊搜索和日期筛选 |

**请求参数 (Body - JSON)**:

| 参数名     | 类型          | 必填 | 说明                                     | 约束             |
| ---------- | ------------- | ---- | ---------------------------------------- | ---------------- |
| userId     | Long          | 否   | 用户ID (后端自动填充)                    | -                |
| title      | String        | 否   | 博客标题 (模糊搜索，空则查全部)          | 最大长度 50      |
| createTime | LocalDateTime | 否   | 创建时间 (查当天数据，空则查全部)        | 格式: ISO 8601   |
| pageNo     | Integer       | 是   | 页码                                     | > 0              |
| pageSize   | Integer       | 是   | 每页条数                                 | > 0              |

**请求示例**:

```json
{
  "title": "Java",
  "createTime": "2025-12-21T00:00:00",
  "pageNo": 1,
  "pageSize": 10
}
```

**响应结果**:

```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "total": 100,
    "pages": 10,
    "list": [
      {
        "id": "博客ID (String)",
        "userId": "用户ID (String)",
        "title": "博客标题",
        "content": "博客内容",
        "createTime": "2025-12-21T10:30:00",
        "updateTime": "2025-12-21T11:00:00"
      }
    ]
  }
}
```

---

### 4. 获取指定博客信息

**接口名称**: `getBlog`

| 项目     | 描述                                   |
| -------- | -------------------------------------- |
| 请求路径 | `GET /blog/{bid}`                      |
| 请求方式 | GET                                    |
| 权限标识 | `BLOG.LIST`                            |
| 功能描述 | 根据博客ID获取博客详细信息 (点击进入博客) |

**路径参数**:

| 参数名 | 类型 | 必填 | 说明   |
| ------ | ---- | ---- | ------ |
| bid    | Long | 是   | 博客ID |

**响应结果**:

成功:
```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "id": "博客ID (String)",
    "userId": "用户ID (String)",
    "title": "博客标题",
    "content": "博客内容",
    "createTime": "2025-12-21T10:30:00",
    "updateTime": "2025-12-21T11:00:00"
  }
}
```

失败 (博客不存在):
```json
{
  "code": 404,
  "msg": "未找到该博客",
  "data": null
}
```

---

### 5. 删除博客

**接口名称**: `deleteBlog`

| 项目     | 描述                             |
| -------- | -------------------------------- |
| 请求路径 | `DELETE /blog/{bid}`             |
| 请求方式 | DELETE                           |
| 权限标识 | `BLOG.DELETE`                    |
| 功能描述 | 删除指定博客 (逻辑删除)           |

**路径参数**:

| 参数名 | 类型 | 必填 | 说明   |
| ------ | ---- | ---- | ------ |
| bid    | Long | 是   | 博客ID |

**响应结果**:

成功:
```json
{
  "code": 200,
  "msg": "Success",
  "data": null
}
```

失败:
```json
{
  "code": 500,
  "msg": "删除失败",
  "data": null
}
```

---

### 6. 修改博客

**接口名称**: `editBlog`

| 项目     | 描述               |
| -------- | ------------------ |
| 请求路径 | `PUT /blog/{bid}`  |
| 请求方式 | PUT                |
| 权限标识 | `BLOG.EDIT`        |
| 功能描述 | 修改博客基本信息   |

**路径参数**:

| 参数名 | 类型 | 必填 | 说明   |
| ------ | ---- | ---- | ------ |
| bid    | Long | 是   | 博客ID |

**请求参数 (Body - JSON)**:

| 参数名  | 类型   | 必填 | 说明                            | 约束               |
| ------- | ------ | ---- | ------------------------------- | ------------------ |
| userId  | Long   | 否   | 用户ID (可由后端自动填充)       | -                  |
| title   | String | 是   | 博客标题 (空白则置空)           | 最大长度 50        |
| content | String | 是   | 博客内容 (空白则置空)           | 最大长度 10000     |

**请求示例**:

```json
{
  "title": "更新后的标题",
  "content": "更新后的内容..."
}
```

**响应结果**:

成功:
```json
{
  "code": 200,
  "msg": "Success",
  "data": null
}
```

失败:
```json
{
  "code": 500,
  "msg": "修改失败",
  "data": null
}
```

---

## 二、评论相关接口

### 7. 分页查询博客评论

**接口名称**: `selectCommentPage`

| 项目     | 描述                             |
| -------- | -------------------------------- |
| 请求路径 | `POST /blog/{bid}/comments/query`|
| 请求方式 | POST                             |
| 权限标识 | `COMMENT.LIST`                   |
| 功能描述 | 分页查询指定博客下的评论列表     |

**路径参数**:

| 参数名 | 类型 | 必填 | 说明   |
| ------ | ---- | ---- | ------ |
| bid    | Long | 是   | 博客ID |

**请求参数 (Body - JSON)**:

| 参数名   | 类型    | 必填 | 说明       |
| -------- | ------- | ---- | ---------- |
| pageNo   | Integer | 否   | 页码       |
| pageSize | Integer | 否   | 每页条数   |
| sortBy   | String  | 否   | 排序字段   |
| isAsc    | Boolean | 否   | 是否升序   |

**请求示例**:

```json
{
  "pageNo": 1,
  "pageSize": 10
}
```

**响应结果**:

成功:
```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "total": 50,
    "pages": 5,
    "list": [
      {
        "id": "评论ID (String)",
        "userId": "用户ID (String)",
        "username": "用户名",
        "nickname": "昵称",
        "createTime": "2025-12-21T10:30:00",
        "updateTime": "2025-12-21T11:00:00"
      }
    ]
  }
}
```

失败 (博客不存在):
```json
{
  "code": 404,
  "msg": "未找到该博客",
  "data": null
}
```

---

### 8. 发表评论

**接口名称**: `addComment`

| 项目     | 描述                       |
| -------- | -------------------------- |
| 请求路径 | `POST /blog/{bid}/comments`|
| 请求方式 | POST                       |
| 权限标识 | `COMMENT.ADD`              |
| 功能描述 | 在指定博客下发表评论       |

**路径参数**:

| 参数名 | 类型 | 必填 | 说明   |
| ------ | ---- | ---- | ------ |
| bid    | Long | 是   | 博客ID |

**请求参数 (Body - JSON)**:

| 参数名  | 类型   | 必填 | 说明                            | 约束           |
| ------- | ------ | ---- | ------------------------------- | -------------- |
| content | String | 是   | 评论内容                        | 最大长度 200   |

**请求示例**:

```json
{
  "content": "这是一条评论内容"
}
```

**响应结果**:

成功:
```json
{
  "code": 200,
  "msg": "Success",
  "data": null
}
```

失败:
```json
{
  "code": 500,
  "msg": "添加失败",
  "data": null
}
```

---

### 9. 条件查询评论

**接口名称**: `queryComments`

| 项目     | 描述                           |
| -------- | ------------------------------ |
| 请求路径 | `POST /blog/comments/query`    |
| 请求方式 | POST                           |
| 权限标识 | `COMMENT.LIST`                 |
| 功能描述 | 根据条件查询评论列表           |

**请求参数 (Body - JSON)**:

| 参数名  | 类型          | 必填 | 说明              |
| ------- | ------------- | ---- | ----------------- |
| userId  | Long          | 否   | 用户ID            |
| blogId  | Long          | 否   | 博客ID            |
| fromDay | LocalDateTime | 否   | 查询起始日期      |
| toDay   | LocalDateTime | 否   | 查询结束日期      |

**请求示例**:

```json
{
  "userId": 1,
  "blogId": 100,
  "fromDay": "2025-12-01T00:00:00",
  "toDay": "2025-12-31T23:59:59"
}
```

**响应结果**:

成功:
```json
{
  "code": 200,
  "msg": "Success",
  "data": [
    {
      "id": "评论ID (String)",
      "userId": "用户ID (String)",
      "username": "用户名",
      "nickname": "昵称",
      "createTime": "2025-12-21T10:30:00",
      "updateTime": "2025-12-21T11:00:00"
    }
  ]
}
```

失败:
```json
{
  "code": 404,
  "msg": "未找到该用户",
  "data": null
}
```

---

### 10. 获取指定评论

**接口名称**: `getComment`

| 项目     | 描述                         |
| -------- | ---------------------------- |
| 请求路径 | `GET /blog/comments/{cid}`   |
| 请求方式 | GET                          |
| 权限标识 | `COMMENT.LIST`               |
| 功能描述 | 根据评论ID获取评论详细信息   |

**路径参数**:

| 参数名 | 类型 | 必填 | 说明   |
| ------ | ---- | ---- | ------ |
| cid    | Long | 是   | 评论ID |

**响应结果**:

成功:
```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "id": "评论ID (String)",
    "userId": "用户ID (String)",
    "username": "用户名",
    "nickname": "昵称",
    "createTime": "2025-12-21T10:30:00",
    "updateTime": "2025-12-21T11:00:00"
  }
}
```

失败 (评论不存在):
```json
{
  "code": 404,
  "msg": "未找到该评论",
  "data": null
}
```

---

### 11. 删除评论

**接口名称**: `deleteComment`

| 项目     | 描述                           |
| -------- | ------------------------------ |
| 请求路径 | `DELETE /blog/comments/{cid}`  |
| 请求方式 | DELETE                         |
| 权限标识 | `COMMENT.DELETE`               |
| 功能描述 | 删除指定评论                   |

**路径参数**:

| 参数名 | 类型 | 必填 | 说明   |
| ------ | ---- | ---- | ------ |
| cid    | Long | 是   | 评论ID |

**响应结果**:

成功:
```json
{
  "code": 200,
  "msg": "Success",
  "data": null
}
```

评论不存在:
```json
{
  "code": 404,
  "msg": "未找到该评论",
  "data": null
}
```

权限不足:
```json
{
  "code": 401,
  "msg": "权限不足",
  "data": null
}
```

服务器错误:
```json
{
  "code": 500,
  "msg": "服务器错误",
  "data": null
}
```

---

## 三、收藏相关接口

### 12. 收藏博客

**接口名称**: `starBlog`

| 项目     | 描述                   |
| -------- | ---------------------- |
| 请求路径 | `POST /blog/{bid}/star`|
| 请求方式 | POST                   |
| 权限标识 | `BLOG.STAR`            |
| 功能描述 | 当前用户收藏指定博客   |

**路径参数**:

| 参数名 | 类型 | 必填 | 说明   |
| ------ | ---- | ---- | ------ |
| bid    | Long | 是   | 博客ID |

**请求参数**: 无

**响应结果**:

成功:
```json
{
  "code": 200,
  "msg": "Success",
  "data": null
}
```

失败:
```json
{
  "code": 500,
  "msg": "收藏失败",
  "data": null
}
```

---

### 13. 取消收藏博客

**接口名称**: `unstarBlog`

| 项目     | 描述                     |
| -------- | ------------------------ |
| 请求路径 | `DELETE /blog/{bid}/star`|
| 请求方式 | DELETE                   |
| 权限标识 | `BLOG.STAR`              |
| 功能描述 | 当前用户取消收藏指定博客 |

**路径参数**:

| 参数名 | 类型 | 必填 | 说明   |
| ------ | ---- | ---- | ------ |
| bid    | Long | 是   | 博客ID |

**请求参数**: 无

**响应结果**:

成功:
```json
{
  "code": 200,
  "msg": "Success",
  "data": null
}
```

失败:
```json
{
  "code": 500,
  "msg": "取消失败",
  "data": null
}
```

---

## 四、用户博客相关接口

### 14. 查询用户博客信息

**接口名称**: `userBlog`

| 项目     | 描述                                       |
| -------- | ------------------------------------------ |
| 请求路径 | `GET /blog/user/{uid}`                     |
| 请求方式 | GET                                        |
| 权限标识 | `USER.LIST`                                |
| 功能描述 | 查询博客模块下的用户信息 (博客数、收藏数等) |

**路径参数**:

| 参数名 | 类型 | 必填 | 说明   |
| ------ | ---- | ---- | ------ |
| uid    | Long | 是   | 用户ID |

**响应结果**:

成功:
```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "userId": "用户ID (String)",
    "username": "用户名",
    "nickname": "昵称",
    "blogCount": 10,
    "starCount": 25
  }
}
```

失败 (用户不存在):
```json
{
  "code": 404,
  "msg": "未找到该用户",
  "data": null
}
```

---

### 15. 分页查询用户发表的博客

**接口名称**: `userBlogBlogs`

| 项目     | 描述                             |
| -------- | -------------------------------- |
| 请求路径 | `POST /blog/user/{uid}/blogs/query` |
| 请求方式 | POST                             |
| 权限标识 | `BLOG.LIST`                      |
| 功能描述 | 分页查询指定用户发表的博客列表   |

**路径参数**:

| 参数名 | 类型 | 必填 | 说明   |
| ------ | ---- | ---- | ------ |
| uid    | Long | 是   | 用户ID |

**请求参数 (Body - JSON)**:

| 参数名   | 类型    | 必填 | 说明       |
| -------- | ------- | ---- | ---------- |
| pageNo   | Integer | 是   | 页码       |
| pageSize | Integer | 是   | 每页条数   |

**请求示例**:

```json
{
  "pageNo": 1,
  "pageSize": 10
}
```

**响应结果**:

成功:
```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "total": 30,
    "pages": 3,
    "list": [
      {
        "id": "博客ID (String)",
        "userId": "用户ID (String)",
        "title": "博客标题",
        "content": "博客内容",
        "createTime": "2025-12-21T10:30:00",
        "updateTime": "2025-12-21T11:00:00"
      }
    ]
  }
}
```

失败 (用户不存在):
```json
{
  "code": 404,
  "msg": "未找到该用户",
  "data": null
}
```

---

### 16. 分页查询用户收藏的博客

**接口名称**: `userBlogStars`

| 项目     | 描述                             |
| -------- | -------------------------------- |
| 请求路径 | `POST /blog/user/{uid}/stars/query` |
| 请求方式 | POST                             |
| 权限标识 | `BLOG.LIST`                      |
| 功能描述 | 分页查询指定用户收藏的博客列表   |

**路径参数**:

| 参数名 | 类型 | 必填 | 说明   |
| ------ | ---- | ---- | ------ |
| uid    | Long | 是   | 用户ID |

**请求参数 (Body - JSON)**:

| 参数名   | 类型    | 必填 | 说明       |
| -------- | ------- | ---- | ---------- |
| pageNo   | Integer | 否   | 页码       |
| pageSize | Integer | 否   | 每页条数   |

**请求示例**:

```json
{
  "pageNo": 1,
  "pageSize": 10
}
```

**响应结果**:

成功:
```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "total": 25,
    "pages": 3,
    "list": [
      {
        "id": "博客ID (String)",
        "userId": "用户ID (String)",
        "title": "博客标题",
        "content": "博客内容",
        "createTime": "2025-12-21T10:30:00",
        "updateTime": "2025-12-21T11:00:00"
      }
    ]
  }
}
```

失败 (用户不存在):
```json
{
  "code": 404,
  "msg": "未找到该用户",
  "data": null
}
```

---

## 五、标签相关接口

### 17. 查询所有标签

**接口名称**: `tags`

| 项目     | 描述               |
| -------- | ------------------ |
| 请求路径 | `GET /blog/tags`   |
| 请求方式 | GET                |
| 权限标识 | `BLOG.LIST`        |
| 功能描述 | 查询所有博客标签   |

**请求参数**: 无

**响应结果**:

```json
{
  "code": 200,
  "msg": "Success",
  "data": [
    {
      "id": "标签ID (String)",
      "name": "标签名称",
      "desc": "标签描述"
    }
  ]
}
```

---

## 六、通用数据结构

### 1. 统一响应格式 (ResponseResult)

```json
{
  "code": 200,
  "msg": "Success",
  "data": {}
}
```

| 字段 | 类型    | 说明                           |
| ---- | ------- | ------------------------------ |
| code | Integer | 状态码 (200成功，其他为失败)   |
| msg  | String  | 响应消息                       |
| data | T       | 响应数据 (泛型)                |

### 2. 分页响应格式 (PageVO)

```json
{
  "total": 100,
  "pages": 10,
  "list": []
}
```

| 字段  | 类型    | 说明         |
| ----- | ------- | ------------ |
| total | Long    | 总记录数     |
| pages | Long    | 总页数       |
| list  | List<T> | 数据列表     |

### 3. 分页请求参数 (PageDTO)

| 参数名   | 类型    | 必填 | 说明               |
| -------- | ------- | ---- | ------------------ |
| pageNo   | Integer | 否   | 页码               |
| pageSize | Integer | 否   | 每页条数           |
| sortBy   | String  | 否   | 排序字段           |
| isAsc    | Boolean | 否   | 是否升序           |

### 4. 博客VO (BlogVO)

| 字段       | 类型          | 说明                         |
| ---------- | ------------- | ---------------------------- |
| id         | String        | 博客ID (Long序列化为String)  |
| userId     | String        | 用户ID (Long序列化为String)  |
| title      | String        | 博客标题                     |
| content    | String        | 博客内容                     |
| createTime | LocalDateTime | 创建时间                     |
| updateTime | LocalDateTime | 更新时间                     |

### 5. 评论VO (CommentVO)

| 字段       | 类型          | 说明                         |
| ---------- | ------------- | ---------------------------- |
| id         | String        | 评论ID (Long序列化为String)  |
| userId     | String        | 用户ID (Long序列化为String)  |
| username   | String        | 用户名                       |
| nickname   | String        | 昵称                         |
| createTime | LocalDateTime | 创建时间                     |
| updateTime | LocalDateTime | 更新时间                     |

### 6. 用户博客VO (UserBlogVO)

| 字段      | 类型    | 说明                         |
| --------- | ------- | ---------------------------- |
| userId    | String  | 用户ID (Long序列化为String)  |
| username  | String  | 用户名                       |
| nickname  | String  | 昵称                         |
| blogCount | Integer | 发表博客数量                 |
| starCount | Integer | 收藏博客数量                 |

### 7. 博客标签VO (BlogTagVO)

| 字段 | 类型   | 说明                         |
| ---- | ------ | ---------------------------- |
| id   | String | 标签ID (Long序列化为String)  |
| name | String | 标签名称                     |
| desc | String | 标签描述                     |

---

## 权限标识汇总

| 权限标识         | 说明         |
| ---------------- | ------------ |
| `BLOG.LIST`      | 博客查询权限 |
| `BLOG.ADD`       | 博客添加权限 |
| `BLOG.EDIT`      | 博客编辑权限 |
| `BLOG.DELETE`    | 博客删除权限 |
| `BLOG.STAR`      | 博客收藏权限 |
| `COMMENT.LIST`   | 评论查询权限 |
| `COMMENT.ADD`    | 评论添加权限 |
| `COMMENT.DELETE` | 评论删除权限 |
| `USER.LIST`      | 用户查询权限 |

---

## API 路由汇总

| 序号 | 方法   | 路径                              | 接口名称            | 权限标识       |
| ---- | ------ | --------------------------------- | ------------------- | -------------- |
| 1    | GET    | `/blog`                           | blogs               | BLOG.LIST      |
| 2    | POST   | `/blog`                           | addBlog             | BLOG.ADD       |
| 3    | POST   | `/blog/query`                     | queryBlog           | BLOG.LIST      |
| 4    | GET    | `/blog/{bid}`                     | getBlog             | BLOG.LIST      |
| 5    | DELETE | `/blog/{bid}`                     | deleteBlog          | BLOG.DELETE    |
| 6    | PUT    | `/blog/{bid}`                     | editBlog            | BLOG.EDIT      |
| 7    | POST   | `/blog/{bid}/comments/query`      | selectCommentPage   | COMMENT.LIST   |
| 8    | POST   | `/blog/{bid}/comments`            | addComment          | COMMENT.ADD    |
| 9    | POST   | `/blog/{bid}/star`                | starBlog            | BLOG.STAR      |
| 10   | DELETE | `/blog/{bid}/star`                | unstarBlog          | BLOG.STAR      |
| 11   | GET    | `/blog/user/{uid}`                | userBlog            | USER.LIST      |
| 12   | POST   | `/blog/user/{uid}/blogs/query`    | userBlogBlogs       | BLOG.LIST      |
| 13   | POST   | `/blog/user/{uid}/stars/query`    | userBlogStars       | BLOG.LIST      |
| 14   | GET    | `/blog/tags`                      | tags                | BLOG.LIST      |
| 15   | POST   | `/blog/comments/query`            | queryComments       | COMMENT.LIST   |
| 16   | GET    | `/blog/comments/{cid}`            | getComment          | COMMENT.LIST   |
| 17   | DELETE | `/blog/comments/{cid}`            | deleteComment       | COMMENT.DELETE |

