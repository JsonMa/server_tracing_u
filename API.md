---
swagger: "2.0"
info:
  version: "1.0"
  description: |
    ### session
    花言一期API使用access_token作为登录凭证，小程序、PC、APP均有效。
    PC还支持cookie，无需显示提供access_token

    ### responses
    以下API仅仅定义data内部的内容，所有API返回格式如下:
    ```
    {
      code: Interger,
      msg:  String,
      errors: [Error],  # 仅在开发环境下提供
      data: Object
    }
    ```

    ### pagination
    ##### 包含pagination标签的API均支持一下query参数
    ```
    {
      start:  Integer,  # default(0)  min(0)            起始偏移量
      count:  Integer,  # default(10) min(1) max(100)   获取个数
      sort:   Bool      # default(true)                 是否按时间正序
    }
    ```
    ##### 返回格式如下
    ```
    {
      code: Interger,
      msg:  String,
      data: {
        count:   Integer,    资源总数量
        start:   Integer,    起始偏移量
        items:   Array
      }
    }
    ```

    ### embed
    部分批量获取接口需要对某些字段进行展开，如user_id展开为user, 因此该类型接口统一支持embed参数。

    For example:
    ```
    GET /cards?embed=user
    {
      code: Integer,
      msg: String,
      {
        cards: [Card],
        users: [User]   // 返回cards中包含的user信息
      }
    }
    ```
    该类型接口均有embed标签

    ### model

    ##### model默认字段说明
    ```
    {
      created_at: Date,      # 2017-06-23T02:37:09.892Z
      updated_at: Date       # 2017-06-23T02:37:09.892Z
    }
    ```

    ### error code

    - 200-500: http错误
    - 1000  - 9999 : 系统内部操作错误, 如DB, REDIS
    - 10000 - 10999: Auth 相关错误
    - 11000 - 11999: Banner 相关错误
    - 12000 - 12999: Commodity attribute value 相关错误
    - 13000 - 13999: Commodity attribute 相关错误
    - 14000 - 14999: Commodity category 相关错误
    - 15000 - 15999: Commodity 相关错误
    - 16000 - 16999: File 相关错误
    - 17000 - 17999: Card 相关错误
    - 18000 - 18999: Printer 相关错误
    - 19000 - 19999: Card category 相关错误
    - 20000 - 20999: Order 相关错误
    - 21000 - 21999: Trade 相关错误
    - 22000 - 22999: Tencent API 相关错误
    - 23000 - 23999: miniProgram API 相关错误


    | 状态码  | 含义          | 说明             |
    | ---- | ----------- | ---------------- |
    | 200  | success     | 请求成功             |
    | 204  | no content  | 请求成功，但是没有返回内容    |
    | 304  | redirect    | 重定向              |
    | 400  | bad request | 参数错误，msg中有错误字段提示 |
    | 403  | forbidden   | 没有登录或者没有管理员权限 |
    | 404  | not found   | 接口不存在            |
    | 500  | error       | 服务器错误            |
    | 10001 | auth error          | Session已失效, 请重新登录      |
    | 10002 | auth error          | 用户名或密码错误               |
    | 10003 | user error          | 用户已存在                    |
    | 10004 | user error          | 用户不存在                    |
    | 10005 | user error          | 不能减少公众号跳转数            |
    | 11001 | banner error          | 视频封面非图片类型文件        |
    | 11002 | banner error          | 非视频类型文件               |
    | 11003 | banner error          | banner不存在                |
    | 13000 | commodity attr error| 商品属性不存在                 |
    | 13001 | commodity attr error| 商品属性已存在                 |
    | 14000 | commodity category error | 商品分类不存在            |
    | 14001 | commodity category error | 商品分类名已存在          |
    | 14002 | commodity category error | 封面非图片类型文件        |
    | 14003 | commodity category error | 商品分类中存在关联商品    |
    | 15000 | commodity error     | 商品不存在                    |
    | 15001 | commodity error     | 商品图片数量需在1~5张范围内     |
    | 15002 | commodity error     | 商品图片重复/丢失或包含非图片类型文件 |
    | 15003 | commodity error     | 参数中包含不存在的商品          |
    | 16000 | file error          | 文件丢失                      |
    | 16001 | file error          | 文件类型错误                   |
    | 16002 | file error          | 文件大小超出限制               |
    | 16003 | file error          | 非图片类型文件，不存在缩略图    |
    | 16004 | file error          | 视频上传失败                  |
    | 17001 | card error          | 贺卡不存在                    |
    | 17002 | card error          | 贺卡已经被编辑过，不能再次编辑   |
    | 17003 | card error          | 录音文件非音频类型              |
    | 17004 | card error          | 贺卡照片数量需在1~5张范围内       |
    | 17005 | card error          | 贺卡照片重复/丢失或包含非图片类型文件  |
    | 17006 | card error          | 录像文件非视频类型              |
    | 17007 | card error          | 录像封面非图片类型              |
    | 17008 | card error          | 贺卡背景非图片类型              |
    | 17009 | card error          | 创建贺卡失败，剩余数量小于1      |
    | 17010 | card error          | 照片非图片类型文件              |
    | 17011 | card error          | 贺卡用户信息非JSON格式          |
    | 17012 | card error          | 贺卡用户信息不存在头像或昵称     |
    | 17013 | card error          | 未完成支付，无法批量生成贺卡     |
    | 17014 | card error          | 该商品类型无法批量生成贺卡       |
    | 18001 | printer error       | printer权限认证相关错误         |
    | 19001 | card category error       | 贺卡背景图片重复/丢失或包含非图片类型文件 |
    | 19002 | card category error       | 贺卡背景音乐重复/丢失或包含非音频类型文件 |
    | 19003 | card category error       | 贺卡分类已经存在 |
    | 19004 | card category error       | 贺卡分类中存在关联贺卡 |
    | 20001 | order error       | 订单不存在 |
    | 21001 | trade error       | openid获取失败 |
    | 22001 | tencent api error       | 腾讯API认证失败 |
    | 23001 | miniProgram api error       | 小程序token获取失败 |

  title: "花言 API"
  termsOfService: "http://111.231.76.244:7001/"
  contact:
    email: "mahao-0321@hotmail.com"
host: "111.231.76.244:7001"
basePath: "/api/v1"
schemes:
  - http
produces:
  - application/json
consumes:
  - application/json
tags:
  - name: user
  - name: pagination
  - name: admin  
  - name: file
  - name: auth  
  - name: commodity
  - name: embed
  - name: card
  - name: blessing
  - name: card_category
  - name: guest

paths:

  /auth/login:
    post:
      description: 用户登录
      tags:
        - auth 
      parameters:
        - in: body
          name: user
          schema:
            type: object
            required:
              - password
              - phone 
            properties:
              phone:
                type: string
              password:
                type: string
      responses:
        200:
          description: Success
          schema:
            type: object
            properties:
              user: 
                $ref: "#/definitions/User"
              token:
                description: access_token

  /auth/logout:
    get:
      description: 退出登录
      tags:
        - auth 
      responses:
        200:
          description: Success

  /files:
    post:
      summary: 上传文件
      tags:
        - file
      description: 文件上传
      consumes:
        - "multipart/form-data"
      parameters:
        - in: formData
          description: 上传的文件
          name: files
          required: true
          type: 'file'
      responses:
        200:
          description: Success
          schema:
            type: array
            items:
              $ref: "#/definitions/File"

  /files/{id}:
    get:
      summary: 获取文件内容
      tags:
        - file
      description: 获取文件内容
      parameters:
        - name: id
          in: path
          description: File ID
          type: string
          format: uuid
          required: true
      responses:
        200:
          description: 文件内容

  /commodities:
    get:
      summary: 商品列表
      tags:
        - commodity
        - pagination
        - embed
      description: 根据查询参数，返回商品列表
      parameters:
        - name: name
          in: query
          description: 商品名称
          type: string
        - name: category_id
          in: query
          description: 所属分类
          type: string
          format: uuid
        - name: status
          in: query
          description: 上/下架状态，取值于Commodity_Status
          type: string
        - name: recommended
          in: query
          description: 是否推荐
          type: boolean
        - name: embed
          in: query
          description: 是否内嵌商品分类（embed='category'时，返回的数据中将包含'categories'字段）
          type: string
      responses:
        200:
          description: 商品列表
          schema:
            type: object
            properties:
              count:
                type: integer
              start:
                type: integer
              items:
                type: array
                items:
                  $ref: '#/definitions/Commodity'
              categories:
                type: array
                items:
                  $ref: '#/definitions/CommodityCategory'
    post:
      tags:
        - commodity
        - admin
      summary: 添加商品
      description: 添加新的商品
      parameters:
        - name: commodity
          in: body
          required: true
          schema:
            type: object
            required:
              - name
              - category_id
              - description
              - price
              - picture_ids
            properties:
              name:
                type: string
                description: 商品名称
              category_id:
                type: string
                format: uuid
                description: 所属类别id
              description:
                type: string
                description: 商品描述
              price:
                type: number
                description: 商品价格
              act_price:
                type: number
                description: 活动价格
              recommended:
                type: boolean
                description: 是否推荐
              attr:
                type: array
                description: 商品属性
                items:
                  type: object
                  properties:
                    attr_name:
                      type: string
                    attr_value:
                      type: array
                      items:
                        type: string
              picture_ids:
                type: array
                description: 商品图片
                items:
                  type: string
                  format: uuid
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/Commodity'
    delete:
      tags:
        - commodity
        - admin
      summary: 删除商品
      description: 批量删除商品
      parameters:
        - name: ids
          in: query
          required: true
          description: 删除的商品ids(eg:ids='1,2,3')
          type: string
      responses:
        200:
          description: Success
          schema:
            type: array
            items:
             $ref: '#/definitions/Commodity'
    patch:
      tags:
        - commodity
        - admin
      summary: 批量修改商品(推荐/上架)
      description: 根据ids批量修改商品
      parameters:
        - name: ids
          in: query
          description: 商品ids(eg:ids=uuid,uuid,uuid)
          type: string
          format: uuid
          required: true
        - name: attributes
          in: body
          required: true
          schema:
            type: object
            properties:
              status:
                type: string
                description: 上/下架状态 -['ON','OFF']
              recommended:
                type: boolean
                description: 推荐 -[true, false]
      responses:
          200:
            description: Success
            schema:
              type: array
              items:
                $ref: '#/definitions/Commodity'

  /commodities/{id}:
    get:
      tags:
        - commodity
      summary: 商品详情
      description: 根据id查询商品详情
      parameters:
        - name: id
          in: path
          required: true
          description: 商品id
          type: string
          format: uuid
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/Commodity'
    patch:
      summary: 修改商品
      description: 根据id修改商品信息
      tags:
        - commodity
        - admin
      parameters:
        - name: id
          in: path
          description: 商品id
          type: string
          format: uuid
          required: true
        - in: body
          name: commodity
          description: 修改商品信息
          required: true
          schema:
            type: object
            properties:
              name:
                type: string
                description: 商品名称
              category_id:
                type: string
                format: uuid
                description: 所属类别id
              description:
                type: string
                description: 商品描述
              price:
                type: number
                description: 商品价格
              act_price:
                type: number
                description: 活动价格
              recommended:
                type: boolean
                description: 是否推荐
              picture_ids:
                type: array
                description: 商品图片
                items:
                  type: string
                  format: uuid
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/Commodity"

  /commodities/{id}/attributes:
    post:
      summary: 增加商品属性
      tags:
        - admin
        - commodity
      description: 为指定商品添加商品属性
      parameters:
        - in: path
          name: id
          required: true
          type: string
          format: uuid
          description: 商品id
        - in: body
          name: attribute
          required: true
          description: 新增的商品属性
          schema:
            type: object
            properties:
              attr_name:
                type: string
                description: 属性名
              attr_value:
                type: array
                description: 属性值数组
                items:
                  type: string
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/CommodityAttr"

    get:
      summary: 获取商品属性列表
      tags:
        - commodity
      description: 获取商品列表
      parameters:
        - in: path
          name: id
          description: 商品id
          required: true
          type: string
          format: uuid
      responses:
        200:
          description: Success
          schema:
            type: array
            items:
              $ref: "#/definitions/CommodityAttr"

  /commodities/{id}/attributes/{attr_id}:
    get:
      summary: 获取商品指定属性
      tags:
        - commodity
      description: 获取指定商品的指定属性
      parameters:
        - in: path
          name: id
          required: true
          type: string
          format: uuid
          description: 商品id
        - in: path
          name: attr_id
          required: true
          type: string
          format: uuid
          description: 属性id
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/CommodityAttr"
    put:
      summary: 修改商品指定属性
      tags:
        - admin
        - commodity
      description: 修改指定商品的属性
      parameters:
        - in: path
          name: id
          required: true
          type: string
          format: uuid
          description: 商品id
        - in: path
          name: attr_id
          required: true
          type: string
          format: uuid
          description: 属性id
        - in: body
          name: attribute
          required: true
          description: 被替换的属性内容
          schema:
            type: object
            properties:
              attr_name:
                type: string
                description: 属性名
              attr_value:
                type: array
                description: 属性值数组
                items:
                  type: string
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/CommodityAttr"

    delete:
      summary: 删除商品指定属性
      tags:
        - admin
        - commodity
      description: 删除指定商品的指定属性
      parameters:
        - in: path
          name: id
          required: true
          type: string
          format: uuid
          description: 商品id
        - in: path
          name: attr_id
          required: true
          type: string
          format: uuid
          description: 属性id
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/CommodityAttr"

  /commodity_categories:
    get:
      tags:
        - commodity_category
        - pagination
      summary: 商品分类列表
      description: 获取商品分类列表
      responses:
        200:
          description: Success
          schema:
            type: object
            properties:
              count:
                type: integer
              start:
                type: integer
              items:
                type: array
                items:
                  $ref: '#/definitions/CommodityCategory'
    post:
      tags:
        - commodity_category
        - admin
      summary: 添加商品分类
      description: 添加商品分类
      parameters:
        - name: commodity_category
          in: body
          required: true
          schema:
            required:
              - name
              - cover_id
            properties:
              name:
                type: string
                description: 商品类名
              cover_id:
                type: string
                format: uuid
                description: 类型封面图id
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/CommodityCategory'
    delete:
      tags:
        - commodity_category
        - admin
      description: 根据ids删除商品分类
      summary: 批量删除商品分类
      parameters:
        - name: ids
          in: query
          required: true
          description: 删除的分类id(eg:ids=uuid,uuid,uuid)
          type: string
      responses:
        200:
          description: Success
          schema:
            type: array
            items:
             $ref: '#/definitions/CommodityCategory'

  /commodity_categories/{id}:
    patch:
      tags:
       - commodity_category
       - admin
      description: 修改商品分类
      summary: 修改商品分类
      parameters:
        - name: id
          in: path
          required: true
          type: string
          description: 商品分类id
          format: uuid
        - name: commodity_category
          in: body
          required: true
          schema:
            properties:
              name:
                type: string
                description: 商品分类名称
              cover_id:
                type: string
                format: uuid
                description: 商品分类封面id
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/CommodityCategory'

  /banners:
    get:
      tags:
        - banner
      summary: 获取banner列表
      description: 获取banner列表
      responses:
        200:
          description: Success
          schema:
            type: object
            properties:
              count:
                type: integer
              items:
                type: array
                items:
                  $ref: '#/definitions/Banner'
    post:
      tags:
        - banner
        - admin
      summary: 添加banner
      description: 添加banner
      parameters:
        - name: picture
          in: body
          required: true
          schema:
            required:
              - cover_id
              - video_url
            properties:
              cover_id:
                type: string
                format: uuid
                description: banner图id
              video_url:
                type: string
                format: uuid
                description: banner video id
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/Banner'

  /banners/{id}:
    delete:
      tags:
        - banner
        - admin
      description: 根据id删除banner
      summary: 删除banner
      parameters:
        - name: id
          in: path
          required: true
          description: 删除的banner id
          format: uuid
          type: string
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/Banner'

    patch:
      tags:
       - banner
       - admin
      description: 修改banner
      summary: 修改banner
      parameters:
        - name: id
          in: path
          required: true
          type: string
          description: banner id
          format: uuid
        - name: picture
          in: body
          required: true
          description: banner封面图
          schema:
            type: object
            required:
              - cover_id
              - video_url
            properties:
              cover_id:
                type: string
                format: uuid
                description: banner图id
              video_url:
                type: string
                format: uuid
                description: banner video id
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/Banner'

  /cards:
    get:
      summary: 贺卡列表
      tags:
        - card
        - admin
        - pagination
        - embed
      description: 根据查询参数，返回贺卡列表
      parameters:
        - name: status
          in: query
          description: 贺卡状态,取值于Card_status
          type: string
        - name: user_id
          in: query
          description: 商家id
          type: string
          format: uuid
      responses:
        200:
          description: 贺卡列表
          schema:
            type: object
            properties:
              count:
                type: integer
              start:
                type: integer
              items:
                type: array
                items:
                  $ref: '#/definitions/Card'
    post:
      tags:
        - card
        - user
      summary: 添加贺卡
      description: 添加新的贺卡
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/Card'

  /cards/{id}:
    get:
      tags:
        - card
      summary: 贺卡详情
      description: 根据id查询贺卡详情
      parameters:
        - name: id
          in: path
          required: true
          description: 贺卡id
          type: string
          format: uuid
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/Card'
    patch:
      summary: 修改贺卡
      description: 根据id修改贺卡信息
      tags:
        - card
        - guest
      parameters:
        - name: id
          in: path
          description: 贺卡id
          type: string
          format: uuid
          required: true
        - in: body
          name: card
          description: 修改贺卡信息
          required: true
          schema:
            type: object
            properties:
              voice_id:
                type: string
                format: uuid
                description: 录音文件id
              video_url:
                type: string
                format: uuid
                description: 录像文件id
              cover_id:
                type: string
                description: 录像封面id
              status:
                type: string
                description: 贺卡状态，取值于Card_Status
              union_id:
                type: string
                format: uuid
                description: 编辑者唯一识别号
              background_id:
                type: string
                format: uuid
                description: 贺卡背景id
              picture_id:
                type: string
                format: uuid
                description: 照片id
              blessing:
                type: string
                description: 贺卡祝福语
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/Card"
    delete:
      tags:
        - card
        - admin
      summary: 删除贺卡
      description: 删除指定贺卡
      parameters:
        - name: id
          in: path
          description: 贺卡id
          type: string
          format: uuid
          required: true
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/Card'

  /card_categories:
    get:
      tags:
        - card_category
        - pagination
      summary: 贺卡分类列表
      description: 获取贺卡分类列表
      responses:
        200:
          description: Success
          schema:
            type: object
            properties:
              count:
                type: integer
              start:
                type: integer
              items:
                type: array
                items:
                  $ref: '#/definitions/CardCategory'
    post:
      tags:
        - card_category
        - admin
      summary: 添加贺卡分类
      description: 添加贺卡分类
      parameters:
        - name: card_category
          in: body
          required: true
          schema:
            required:
              - name
            properties:
              name:
                type: string
                description: 商品类名
              music_ids:
                type: array
                items:
                  type: string
                  format: uuid
                description: 背景音乐ids
              background_ids:
                type: array
                items:
                  type: string
                  format: uuid
                description: 背景图
              blessing:
                type: array
                items:
                  type: string
                description: 祝福语
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/CardCategory'

  /card_categories/{id}:
    patch:
      tags:
       - card_category
       - admin
      description: 修改贺卡分类
      summary: 修改贺卡分类
      parameters:
        - name: id
          in: path
          required: true
          type: string
          description: 贺卡分类id
          format: uuid
        - name: card_category
          in: body
          required: true
          schema:
            properties:
              name:
                type: string
                description: 商品类名
              music_ids:
                type: array
                items:
                  type: string
                  format: uuid
                description: 背景音乐ids
              background_ids:
                type: array
                items:
                  type: string
                  format: uuid
                description: 背景图
              blessing:
                type: array
                items:
                  type: string
                description: 祝福语
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/CardCategory'
    
    delete:
      tags:
        - card_category
        - admin
      description: 根据id删除贺卡分类
      summary: 删除指定贺卡分类
      parameters:
        - name: id
          in: path
          required: true
          type: string
          description: 贺卡分类id
          format: uuid
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/CardCategory'

definitions:

  Commodity_Status:
    type: string
    description: 上/下架状态
    enum: [
      'ON',
      'OFF',
    ]

  Card_Status:
    type: string
    description: 空/非空状态
    enum: [
      'BLANK',
      'NONBLANK',
    ]

  User:
    properties:
      id:
        type: string
        format: uuid
      no:
        type: integer
      name:
        type: string
      phone:
        type: string
      contact:
        type: string
      address:
        type: string
      avatar_id:
        type: string
        format: uuid
      card_num:
        type: integer
      card_total:
        type: integer
      picture_ids:
        type: array
        description: 商品图片id
        items:
          type: string
          format: uuid
      url:
        type: string
      status:
        $ref: "#/definitions/Commodity_Status"
      role:
        type: string

  File:
    properties:
      id:
        type: string
        format: uuid
      name:
        type: string
        description: 文件名
      type:
        type: string
        description: 文件类型
      size:
        type: string
        description: 文件大小

  Commodity:
    type: object
    properties:
      id:
        type: string
        format: uuid
        description: 商品id
      description:
        type: string
        description: 商品描述
      price:
        type: number
        description: 商品价格
      act_price:
        type: number
        description: 活动价格
      total:
        type: number
        default: 0
        description: 商品总数
      sales:
        type: number
        default: 0
        description: 已售出数量
      recommended:
        type: boolean
        default: false
        description: 是否推荐
      status:
        $ref: "#/definitions/Commodity_Status"
      attr_ids:
        type: array
        description: 属性id
        items:
          type: string
          format: uuid
      category_id:
        type: string
        format: uuid
        description: 商品所属类型id
      picture_ids:
        type: array
        description: 商品图片id
        items:
          type: string
          format: uuid

  CommodityAttr:
    type: object
    properties:
      id:
        type: string
        format: uuid
      name:
        type: string
        description: 属性描述
      values:
        type: array
        description: 属性值
        items:
          type: string
      commodity_id:
        type: string
        format: uuid
        description: 商品id

  CommodityCategory:
    type: object
    properties:
      id:
        type: string
        format: uuid
      name:
        type: string
        description: 类型名
      cover_id:
        type: string
        format: uuid
        description: 产品类型封面id

  Banner:
    properties:
      id:
        type: string
        format: uuid
      cover_id:
        type: string
        format: uuid
      video_url:
        type: string
        format: uuid
        
  CardCategory:
    properties:
      id:
        type: string
        format: uuid
      no:
        type: number
        description: 贺卡分类序号
      name:
        type: string
        description: 分类名
      background_ids:
        type: array
        description: 背景图
        items:
          type: string
          format: uuid
      music_ids:
        type: array
        description: 背景音乐
        items:
          type: string
          format: uuid
      blessings:
        type: array
        description: 祝福语
        items:
          type: string

  Card:
    type: object
    properties:
      id:
        type: string
        format: uuid
        description: 贺卡id
      no:
        type: number
        description: 贺卡序号
      voice_id:
        type: string
        format: uuid
        description: 录音文件id
      video_url:
        type: string
        format: uuid
        description: 录像文件id
      cover_id:
        type: string
        format: uuid
        description: 录像封面文件id
      blessing:
        type: string
        description: 祝福语
      background_id:
        type: string
        format: uuid
        description: 背景图id
      click:
        type: number
        default: 0
        description: 点击量
      status:
        $ref: "#/definitions/Card_Status"
      picture_id:
        type: string
        format: uuid
        description: 照片id
      union_id:
        type: string
        format: uuid
        description: 贺卡编辑者id
      user_id:
        type: string
        format: uuid
        description: 商家id
