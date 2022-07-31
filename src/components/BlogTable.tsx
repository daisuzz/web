import {Link} from "gatsby"
import * as React from "react"
import {DateUtils} from "../DateUtils"
import {Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography,} from "@mui/material";

interface BlogArticleTableProps {
    blogs: Blog[]
}

export interface Blog {
    blogsId: string
    title: string
    publishedAt: string
}

const BlogTable: React.FC<BlogArticleTableProps> = ({blogs}) => {
    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableBody>
                    {blogs.map(blog => {
                        const title = blog.title || blog.blogsId
                        const publishedDate = DateUtils.formatDate(
                            new Date(Date.parse(blog.publishedAt)),
                            "YYYY年MM月DD日 hh:mm"
                        )
                        return (
                            <TableRow key={blog.blogsId}>
                                <TableCell align="left">
                                    <Typography
                                        variant="body1"
                                        color="textPrimary"
                                        component="p"
                                    >
                                        <Link
                                            to={`/${blog.blogsId}`}
                                            rel="noreferrer noopener"
                                            target="_blank"
                                        >
                                            {title}
                                        </Link>
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        component="p"
                                    >
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {publishedDate}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default BlogTable
